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
    // Return hardcoded plans since we don't have subscription_plans table yet
    const plans = [
      {
        id: 'free',
        name: 'Free',
        description: 'Perfect for trying out',
        price: 0,
        features: ['1 chatbot', '100 messages/month', 'Basic customization']
      },
      {
        id: 'basic',
        name: 'Basic',
        description: 'For small businesses',
        price: 19,
        features: ['3 chatbots', '1,000 messages/month', 'Full customization', 'Email support']
      },
      {
        id: 'pro',
        name: 'Pro',
        description: 'For growing companies',
        price: 49,
        features: ['10 chatbots', '10,000 messages/month', 'Advanced analytics', 'Priority support', 'Custom branding']
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations',
        price: 199,
        features: ['Unlimited chatbots', 'Unlimited messages', 'Dedicated support', 'SLA guarantee', 'Custom integrations']
      }
    ];
    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /billing/current - get current subscription
router.get('/current', async (req, res) => {
  try {
    // Return free plan for now
    res.json({
      plan: 'free',
      status: 'active',
      periodEnd: null
    });
  } catch (error) {
    console.error('Get current plan error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /billing/create-checkout - create checkout session
router.post('/create-checkout', async (req, res) => {
  try {
    const { planId } = req.body;
    // TODO: Integrate with Stripe
    res.json({
      message: 'Stripe integration coming soon',
      planId
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /billing/cancel - cancel subscription
router.post('/cancel', async (req, res) => {
  try {
    // TODO: Integrate with Stripe
    res.json({
      message: 'Subscription cancelled',
      status: 'cancelled'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /billing/history - get billing history
router.get('/history', async (req, res) => {
  try {
    // Return empty history for now
    res.json([]);
  } catch (error) {
    console.error('Get billing history error:', error);
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
