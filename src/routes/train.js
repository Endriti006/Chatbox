const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { spawn } = require('child_process');
const path = require('path');

// POST /train - trigger a training job (site embedding)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { siteUrl } = req.body;
    if (!siteUrl) {
      return res.status(400).json({ error: 'siteUrl is required' });
    }

    // Launch training script as background process
    const scriptPath = path.join(__dirname, '../../scripts/trainSite.js');
    const child = spawn('node', [scriptPath, req.user.id, siteUrl], {
      detached: true,
      stdio: 'ignore'
    });

    // Don't wait for process to complete
    child.unref();

    res.json({ 
      status: 'queued',
      message: 'Training job started. This may take a few minutes.'
    });
  } catch (error) {
    console.error('Training error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /train/status - check training status
router.get('/status', requireAuth, async (req, res) => {
  // TODO: Implement job status tracking
  res.json({ status: 'not_implemented' });
});

module.exports = router;
