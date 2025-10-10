const aiService = require('../services/aiService');
const dbService = require('../services/dbService');
const enhancedTestStore = require('../services/enhancedTestStore');

// Initialize enhanced test data if no database is configured
if (!process.env.DATABASE_URL) {
  console.log('No database configured, initializing enhanced test data...');
  enhancedTestStore.initializeMultipleUsers();
}

/**
 * POST /chat
 * Body: { userId, message }
 * Flow:
 *  - validate input
 *  - fetch relevant documents (embeddings) from DB or test store
 *  - call AI service with context + message
 *  - store chat record (optional)
 */
async function handleChat(req, res) {
  try {
    const { userId, message } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    console.log(`\n💬 Chat request from: ${userId}`);
    console.log(`📝 Message: ${message}`);

    // Get relevant context
    const contexts = await dbService.getRelevantChunks(userId, message, 5);
    console.log(`📚 Retrieved ${contexts.length} context chunks`);
    
    if (contexts.length > 0) {
      console.log(`📄 Sample context: ${contexts[0].substring(0, 100)}...`);
    }

    // Call AI service
    const answer = await aiService.generateAnswer({ userId, message, contexts });
    console.log(`🤖 AI response generated: ${answer.substring(0, 100)}...`);

    // Save chat to store
    if (!process.env.DATABASE_URL) {
      enhancedTestStore.storeChat(userId, message, answer);
    }

    return res.json({ answer });
  } catch (err) {
    console.error('❌ handleChat error:', err);
    return res.status(500).json({ error: 'internal_error', details: err.message });
  }
}

module.exports = { handleChat };