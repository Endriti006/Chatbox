const express = require('express');
const router = express.Router();
const { supabase, getUserProfile, updateUserProfile } = require('../services/supabaseService');
const { requireAuth } = require('../middleware/auth');

// Sign up with email
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Sign in with email
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const profile = await getUserProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    // Prevent updating sensitive fields
    delete updates.id;
    delete updates.email;
    
    const profile = await updateUserProfile(req.user.id, updates);
    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check auth status
router.get('/status', requireAuth, (req, res) => {
  res.json({ authenticated: true, user: req.user });
});

module.exports = router;
