const { Client } = require('pg');
const testStore = require('./testStore');

// Initialize test data by default in development
if (process.env.NODE_ENV !== 'production') {
  testStore.initializeTestData('test-user-123');
}

// Lazy Postgres client. This prevents the module from throwing at import time when the
// DATABASE_URL isn't set or Postgres isn't available (useful for local development).
let client = null;
let triedConnect = false;
let usingTestStore = process.env.NODE_ENV !== 'production';

async function ensureClient() {
  if (client) return client;
  const connStr = process.env.DATABASE_URL;
  if (!connStr) {
    // No database configured; use test store
    console.log('No database configured, using in-memory test store');
    usingTestStore = true;
    return null;
  }

  client = new Client({ connectionString: connStr });
  try {
    await client.connect();
    return client;
  } catch (err) {
    // Don't throw on import; log and return null so callers can fallback gracefully.
    console.error('Postgres connection error:', err.message);
    console.log('Falling back to in-memory test store');
    client = null;
    triedConnect = true;
    usingTestStore = true;
    return null;
  }
}

const OpenAI = require('openai');

// Lazy OpenAI client for embeddings
let openai = null;
function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

/**
 * getRelevantChunks - Retrieve top-N most relevant document chunks for a user
 * Uses pgvector for similarity search on embeddings.
 * Falls back to basic text search if vector search is not available.
 * If no database is available, uses in-memory test store.
 */
async function getRelevantChunks(userId, queryText, limit = 5) {
  const cli = await ensureClient();
  if (!cli) {
    if (usingTestStore) {
      // Simple relevance matching for test data
      const documents = testStore.getDocuments(userId);
      return documents.filter(doc => 
        doc.toLowerCase().includes(queryText.toLowerCase())
      ).slice(0, limit);
    }
    return [];
  }

  try {
    // Try to get embedding for query
    let queryEmbedding = null;
    const oai = getOpenAI();
    if (oai) {
      const embResp = await oai.embeddings.create({ 
        model: 'text-embedding-3-small',
        input: queryText 
      });
      queryEmbedding = embResp.data?.[0]?.embedding;
    }

    let sql, params;
    if (queryEmbedding) {
      // Use vector similarity search
      sql = `
        SELECT content, 1 - (embedding <=> $1) as similarity 
        FROM documents 
        WHERE user_id = $2 
          AND embedding IS NOT NULL
        ORDER BY embedding <=> $1 
        LIMIT $3
      `;
      params = [queryEmbedding, userId, limit];
    } else {
      // Fallback to basic text search
      sql = `
        SELECT content,
          ts_rank_cd(to_tsvector('english', content), to_tsquery('english', $1)) as similarity
        FROM documents 
        WHERE user_id = $2 
          AND to_tsvector('english', content) @@ to_tsquery('english', $1)
        ORDER BY similarity DESC
        LIMIT $3
      `;
      // Convert query to tsquery format (replace spaces with &)
      const tsQuery = queryText.split(' ').filter(Boolean).join(' & ');
      params = [tsQuery, userId, limit];
    }

    const res = await cli.query(sql, params);
    return res.rows.map((r) => r.content);
  } catch (err) {
    console.error('getRelevantChunks error:', err.message);
    return [];
  }
}

/**
 * saveChat - optional helper to persist chats. Uses test store if no database.
 */
async function saveChat({ userId, question, answer }) {
  const cli = await ensureClient();
  if (!cli) {
    if (usingTestStore) {
      testStore.storeChat(userId, question, answer);
      return;
    }
    return null;
  }
  try {
    await cli.query('INSERT INTO chats (user_id, question, answer) VALUES ($1, $2, $3)', [userId, question, answer]);
  } catch (err) {
    console.error('saveChat error:', err.message);
  }
}

module.exports = { getRelevantChunks, saveChat };
