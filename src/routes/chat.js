const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');

// POST /chat - protected by auth (except in test mode)
router.post('/', (req, res, next) => {
  // Skip auth in test/development mode
  if (process.env.NODE_ENV !== 'production') {
    return chatController.handleChat(req, res);
  }
  // Use auth middleware in production
  requireAuth(req, res, next);
}, (req, res) => {
  req.body.userId = req.user?.id || req.body.userId;
  return chatController.handleChat(req, res);
});

module.exports = router;
