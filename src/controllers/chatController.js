const aiService = require('../services/aiService');
const dbService = require('../services/dbService');
const testStore = require('../services/testStore');

// Initialize test data if no database is configured
if (!process.env.DATABASE_URL) {
  console.log('No database configured, initializing test data...');
  testStore.initializeTestData();
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

    // Get relevant context - this might be failing silently
    const contexts = await dbService.getRelevantChunks(userId, message, 5);
    console.log('Retrieved contexts:', contexts); // Add this debug line

    // Call AI service
    const answer = await aiService.generateAnswer({ userId, message, contexts });
    console.log('AI response:', answer); // Add this debug line

    return res.json({ answer });
  } catch (err) {
    console.error('handleChat error:', err); // Improve error logging
    return res.status(500).json({ error: 'internal_error', details: err.message });
  }
}

module.exports = { handleChat };
