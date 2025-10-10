const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { createCheckoutSession, createPortalSession, handleWebhookEvent } = require('../services/stripeService');

// POST /billing/checkout - create checkout session
router.post('/checkout', requireAuth, async (req, res) => {
  try {
    const { priceId } = req.body;
    if (!priceId) {
      return res.status(400).json({ error: 'priceId is required' });
    }

    const session = await createCheckoutSession({
      userId: req.user.id,
      email: req.user.email,
      priceId,
      successUrl: `${req.headers.origin}/dashboard?checkout=success`,
      cancelUrl: `${req.headers.origin}/pricing?checkout=cancelled`
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /billing/portal - create customer portal session
router.post('/portal', requireAuth, async (req, res) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', req.user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found' });
    }

    const session = await createPortalSession(
      profile.stripe_customer_id,
      `${req.headers.origin}/dashboard`
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /billing/plans - list available subscription plans
router.get('/plans', async (req, res) => {
  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_monthly');

    if (error) throw error;
    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /billing/webhook - handle Stripe webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    await handleWebhookEvent(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
