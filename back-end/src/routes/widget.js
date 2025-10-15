const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getUserProfile, supabase } = require('../services/supabaseService');

/**
 * GET /widget/code/:chatbotId - Generate widget embed code for a chatbot
 */
router.get('/code/:chatbotId', async (req, res) => {
  try {
    const { chatbotId } = req.params;
    
    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .single();

    if (error) throw error;

    const embedCode = `
<!-- AI Chatbot Widget -->
<script>
  window.chatbotConfig = {
    chatbotId: "${chatbotId}",
    apiUrl: "${process.env.API_URL || 'http://localhost:3002'}",
    color: "${chatbot.color || '#3b82f6'}",
    position: "${chatbot.position || 'bottom-right'}",
    greeting: "${chatbot.greeting_message || 'Hello! How can I help you today?'}"
  };
</script>
<script src="${process.env.WIDGET_URL || 'http://localhost:3002'}/widget.js"></script>
<!-- End AI Chatbot Widget -->
    `.trim();

    res.json({
      embedCode,
      chatbotId: chatbotId,
      settings: {
        name: chatbot.name,
        color: chatbot.color || '#3b82f6',
        position: chatbot.position || 'bottom-right',
        greeting: chatbot.greeting_message || 'Hello! How can I help you today?'
      }
    });
  } catch (error) {
    console.error('Widget code generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /widget/settings/:chatbotId - Get widget settings
 */
router.get('/settings/:chatbotId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chatbots')
      .select('color, position, greeting_message')
      .eq('id', req.params.chatbotId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get widget settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /widget/settings/:chatbotId - Update widget settings
 */
router.put('/settings/:chatbotId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chatbots')
      .update({
        color: req.body.color,
        position: req.body.position,
        greeting_message: req.body.greeting_message
      })
      .eq('id', req.params.chatbotId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update widget settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /widget/code - Generate widget embed code for user (legacy)
 */
router.get('/code', requireAuth, async (req, res) => {
  try {
    const profile = await getUserProfile(req.user.id);
    
    const embedCode = `
<!-- AI Chatbot Widget -->
<script 
  src="${process.env.WIDGET_URL || 'http://localhost:3002'}/widget.js"
  data-chatbot-id="${req.user.id}"
  data-api-url="${process.env.API_URL || 'http://localhost:3002'}"
  data-color="${profile.chatbot_color || '#0084ff'}"
  data-bot-name="${profile.chatbot_name || 'ChatBot'}"
></script>
<!-- End AI Chatbot Widget -->
    `.trim();

    res.json({
      embedCode,
      userId: req.user.id,
      settings: {
        botName: profile.chatbot_name || 'ChatBot',
        color: profile.chatbot_color || '#0084ff',
        greeting: profile.chatbot_greeting || 'Hi! How can I help you today?'
      }
    });
  } catch (error) {
    console.error('Widget code generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /widget.js - Serve the actual widget JavaScript file
 */
router.get('/widget.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // In production, serve from a CDN or static file
  // For now, return the widget code
  const widgetCode = require('fs').readFileSync(
    require('path').join(__dirname, '../../public/widget.js'),
    'utf8'
  );
  
  res.send(widgetCode);
});

/**
 * GET /widget/preview - Preview widget in iframe
 */
router.get('/preview', requireAuth, async (req, res) => {
  try {
    const profile = await getUserProfile(req.user.id);
    
    const previewHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chatbot Preview</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f0f0f0;
    }
    .preview-info {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="preview-info">
    <h2>Chatbot Preview</h2>
    <p>This is how your chatbot will appear on your website.</p>
    <p><strong>Bot Name:</strong> ${profile.chatbot_name || 'ChatBot'}</p>
    <p><strong>Color:</strong> <span style="display: inline-block; width: 20px; height: 20px; background: ${profile.chatbot_color || '#0084ff'}; border-radius: 4px; vertical-align: middle;"></span></p>
  </div>

  <!-- Widget Script -->
  <script 
    src="${process.env.WIDGET_URL || 'http://localhost:3002'}/widget.js"
    data-chatbot-id="${req.user.id}"
    data-api-url="${process.env.API_URL || 'http://localhost:3002'}"
    data-color="${profile.chatbot_color || '#0084ff'}"
    data-bot-name="${profile.chatbot_name || 'ChatBot'}"
  ></script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(previewHTML);
  } catch (error) {
    console.error('Preview generation error:', error);
    res.status(500).send('Error generating preview');
  }
});

module.exports = router;