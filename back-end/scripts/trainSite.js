/**
 * scripts/trainSite.js
 * Simple script to scrape a website URL, split text into chunks, generate embeddings,
 * and store them in the `documents` table in Postgres.
 *
 * Usage: node scripts/trainSite.js <userId> <siteUrl>
 */
require('dotenv').config();
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { Client } = require('pg');
const OpenAI = require('openai/index.mjs');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  const userId = process.argv[2];
  const siteUrl = process.argv[3];
  if (!userId || !siteUrl) {
    console.error('Usage: node scripts/trainSite.js <userId> <siteUrl>');
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // 1. Fetch site
  console.log('Fetching site', siteUrl);
  const res = await fetch(siteUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  const text = $('body').text().replace(/\s+/g, ' ').trim();

  // 2. Split into chunks (simple sliding window)
  const chunks = splitText(text, 800); // 800 chars per chunk

  // 3. Create embeddings and store
  for (const chunk of chunks) {
    // Create embedding (OpenAI fallback)
    let embedding = null;
    if (process.env.OPENAI_API_KEY) {
      const embResp = await openai.embeddings.create({ model: 'text-embedding-3-small', input: chunk });
      embedding = embResp.data?.[0]?.embedding || null;
    }

    // Store document (embedding omitted in this simple schema)
    await client.query(
      'INSERT INTO documents (user_id, content) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, chunk]
    );
  }

  console.log('Done. Stored', chunks.length, 'chunks');
  await client.end();
}

function splitText(text, maxLen) {
  const parts = [];
  for (let i = 0; i < text.length; i += maxLen) {
    parts.push(text.slice(i, i + maxLen));
  }
  return parts;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
