const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getUserProfile } = require('../services/supabaseService');

/**
 * GET /widget/code - Generate widget embed code for user
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