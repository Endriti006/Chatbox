const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// GET /admin/chats - get chat history
router.get('/chats', requireAuth, async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const chats = await adminController.getChatHistory(
      req.user.id,
      parseInt(limit) || 50,
      parseInt(offset) || 0
    );
    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /admin/chatbot - update chatbot settings
router.put('/chatbot', requireAuth, async (req, res) => {
  try {
    const settings = {
      name: req.body.name,
      greeting: req.body.greeting,
      color: req.body.color
    };
    
    const updated = await adminController.updateChatbotSettings(req.user.id, settings);
    res.json(updated);
  } catch (error) {
    console.error('Update chatbot error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /admin/settings - get user settings
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const settings = await adminController.getUserSettings(req.user.id);
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /admin/settings - update user settings
router.put('/settings', requireAuth, async (req, res) => {
  try {
    const settings = req.body;
    const updated = await adminController.updateUserSettings(req.user.id, settings);
    res.json(updated);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /admin/chats/:chatId/rate - rate a chat interaction
router.post('/chats/:chatId/rate', requireAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const updated = await adminController.rateChatInteraction(req.user.id, chatId, rating);
    res.json(updated);
  } catch (error) {
    console.error('Rate chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;