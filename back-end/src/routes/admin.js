const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const { supabase } = require('../services/supabaseService');

// GET /admin/chatbots - get all chatbots (NO AUTH for now)
router.get('/chatbots', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chatbots')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Get chatbots error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /admin/chatbots/:id - get single chatbot
router.get('/chatbots/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get chatbot error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /admin/chatbots - create new chatbot
router.post('/chatbots', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chatbots')
      .insert({
        name: req.body.name,
        website_url: req.body.website_url,
        greeting_message: req.body.greeting_message || 'Hello! How can I help you today?',
        color: req.body.color || '#3b82f6',
        position: req.body.position || 'bottom-right'
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Create chatbot error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /admin/chatbots/:id - update chatbot
router.put('/chatbots/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chatbots')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update chatbot error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /admin/chatbots/:id - delete chatbot
router.delete('/chatbots/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('chatbots')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Chatbot deleted successfully' });
  } catch (error) {
    console.error('Delete chatbot error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /admin/analytics/:chatbotId - get analytics/stats for a chatbot
router.get('/analytics/:chatbotId', async (req, res) => {
  try {
    const { chatbotId } = req.params;

    // Get chat statistics
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('id, created_at')
      .eq('chatbot_id', chatbotId);

    if (chatsError) throw chatsError;

    // Get message count
    const { count: messageCount, error: messagesError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('chat_id', chats.map(c => c.id));

    if (messagesError) throw messagesError;

    res.json({
      totalChats: chats.length,
      totalMessages: messageCount || 0,
      avgResponseTime: '< 1s',
      lastActive: chats.length > 0 ? chats[0].created_at : null
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /admin/chats/:chatbotId - get chats for a specific chatbot
router.get('/chats/:chatbotId', async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('chats')
      .select(`
        id,
        session_id,
        created_at,
        messages (
          id,
          role,
          content,
          created_at
        )
      `)
      .eq('chatbot_id', chatbotId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /admin/chats - get chat history (legacy, kept for compatibility)
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