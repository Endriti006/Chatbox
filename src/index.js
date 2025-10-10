// Entry point for Express server
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const chatRoutes = require('./routes/chat');
const trainRoutes = require('./routes/train');
const authRoutes = require('./routes/auth');
const billingRoutes = require('./routes/billing');
const adminRoutes = require('./routes/admin');
const widgetRoutes = require('./routes/widget');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files (for widget)
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/auth', authRoutes);
app.use('/train', trainRoutes);
app.use('/chat', chatRoutes);
app.use('/billing', billingRoutes);
app.use('/admin', adminRoutes);
app.use('/widget', widgetRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AI Chatbot Builder API',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      chat: '/chat',
      train: '/train',
      billing: '/billing',
      admin: '/admin',
      widget: '/widget',
      health: '/health'
    }
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`\n🚀 Server listening on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});