const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { spawn } = require('child_process');
const path = require('path');
const { supabase } = require('../services/supabaseService');

// Lazy load training service to avoid blocking server startup
let trainingService = null;
const getTrainingService = () => {
  if (!trainingService) {
    console.log('🔄 Loading Puppeteer training service...');
    trainingService = require('../services/puppeteerTrainingService');
  }
  return trainingService;
};

// POST /train/website - trigger a training job (site embedding)
router.post('/website', async (req, res) => {
  try {
    const { chatbotId, url } = req.body;
    if (!chatbotId || !url) {
      return res.status(400).json({ error: 'chatbotId and url are required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Create training job record
    const { data: job, error } = await supabase
      .from('training_jobs')
      .insert({
        chatbot_id: chatbotId,
        status: 'pending',
        total_pages: 0,
        pages_processed: 0
      })
      .select()
      .single();

    if (error) throw error;

    // Start training in the background with Puppeteer (bypasses Cloudflare!)
    const service = getTrainingService();
    service.reset(); // Reset visited URLs
    service.trainWebsite(chatbotId, url, job.id).catch(error => {
      console.error('Background training error:', error);
    });

    res.json({ 
      status: 'success',
      jobId: job.id,
      message: 'Training job started. This may take a few minutes.'
    });
  } catch (error) {
    console.error('Training error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /train/retrain/:chatbotId - retrain a chatbot
router.post('/retrain/:chatbotId', async (req, res) => {
  try {
    const { chatbotId } = req.params;

    // Get the chatbot's website URL
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('website_url')
      .eq('id', chatbotId)
      .single();

    if (chatbotError) throw chatbotError;
    if (!chatbot.website_url) {
      return res.status(400).json({ error: 'Chatbot has no website URL configured' });
    }

    // Create new training job
    const { data: job, error } = await supabase
      .from('training_jobs')
      .insert({
        chatbot_id: chatbotId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      status: 'success',
      jobId: job.id,
      message: 'Retraining started'
    });
  } catch (error) {
    console.error('Retrain error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /train/status/:chatbotId - check training status
router.get('/status/:chatbotId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('training_jobs')
      .select('*')
      .eq('chatbot_id', req.params.chatbotId)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No jobs found
      return res.json({ status: 'not_started' });
    }

    res.json(data);
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /train - legacy endpoint (keep for compatibility)
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
