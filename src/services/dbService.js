const { Client } = require('pg');
const enhancedTestStore = require('./enhancedTestStore');

// Lazy Postgres client
let client = null;
let triedConnect = false;
let usingTestStore = process.env.NODE_ENV !== 'production';

async function ensureClient() {
  if (client) return client;
  const connStr = process.env.DATABASE_URL;
  if (!connStr) {
    console.log('No database configured, using in-memory test store');
    usingTestStore = true;
    return null;
  }

  client = new Client({ connectionString: connStr });
  try {
    await client.connect();
    return client;
  } catch (err) {
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
 * Uses enhanced test store with business-specific data in development
 */
async function getRelevantChunks(userId, queryText, limit = 5) {
  const cli = await ensureClient();
  
  if (!cli) {
    if (usingTestStore) {
      // Use enhanced test store with business-specific context
      const documents = enhancedTestStore.getDocuments(userId);
      
      if (documents && documents.length > 0) {
        console.log(`📚 Using enhanced test store for ${userId}: ${documents.length} documents found`);
        
        // Enhanced relevance matching with better keyword detection
        const queryLower = queryText.toLowerCase();
        const keywords = queryLower.split(' ').filter(w => w.length > 2);
        
        // Define topic-specific keywords
        const topicKeywords = {
          hours: ['hour', 'open', 'close', 'time', 'when', 'schedule'],
          contact: ['contact', 'phone', 'email', 'call', 'reach', 'address'],
          price: ['price', 'cost', 'much', 'fee', 'rate', 'membership', 'dollar'],
          services: ['service', 'offer', 'provide', 'do', 'specialize', 'include']
        };
        
        const scoredDocs = documents.map(doc => {
          const docLower = doc.toLowerCase();
          let score = 0;
          
          // Score based on direct keyword matches
          keywords.forEach(keyword => {
            if (docLower.includes(keyword)) {
              score += 3;
            }
          });
          
          // Boost score for topic relevance
          Object.entries(topicKeywords).forEach(([topic, words]) => {
            const queryHasTopic = words.some(w => queryLower.includes(w));
            const docHasTopic = words.some(w => docLower.includes(w));
            
            if (queryHasTopic && docHasTopic) {
              score += 5;
            }
          });
          
          // Boost for exact phrase match
          if (docLower.includes(queryLower)) {
            score += 10;
          }
          
          return { doc, score };
        });
        
        // Sort by score
        const sortedDocs = scoredDocs.sort((a, b) => b.score - a.score);
        
        // Return top scored documents, or all if no good matches
        const topDocs = sortedDocs
          .filter(item => item.score > 0)
          .slice(0, limit)
          .map(item => item.doc);
        
        if (topDocs.length === 0) {
          console.log('⚠️  No keyword matches, returning all documents');
          return documents;
        }
        
        console.log(`✅ Returning ${topDocs.length} relevant documents (scores: ${sortedDocs.slice(0, limit).map(d => d.score).join(', ')})`);
        return topDocs;
      }
      
      console.log('⚠️  No documents found for user, returning empty array');
      return [];
    }
    return [];
  }

  // Database implementation (PostgreSQL with pgvector)
  try {
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
 * saveChat - optional helper to persist chats
 */
async function saveChat({ userId, question, answer }) {
  const cli = await ensureClient();
  if (!cli) {
    if (usingTestStore) {
      enhancedTestStore.storeChat(userId, question, answer);
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