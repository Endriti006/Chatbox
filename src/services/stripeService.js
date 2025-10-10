const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { supabase } = require('./supabaseService');

/**
 * Create or retrieve a Stripe customer for a user
 */
async function getOrCreateCustomer(userId, email) {
  try {
    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profile?.stripe_customer_id) {
      return profile.stripe_customer_id;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      metadata: { userId }
    });

    // Save customer ID
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId);

    return customer.id;
  } catch (error) {
    console.error('Stripe customer error:', error);
    throw error;
  }
}

/**
 * Create a Stripe Checkout session for subscription
 */
async function createCheckoutSession({ userId, email, priceId, successUrl, cancelUrl }) {
  const customerId = await getOrCreateCustomer(userId, email);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1
    }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId }
  });

  return session;
}

/**
 * Create a billing portal session
 */
async function createPortalSession(customerId, returnUrl) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  });

  return session;
}

/**
 * Handle Stripe webhook events
 */
async function handleWebhookEvent(event) {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;
    }
  } catch (error) {
    console.error('Webhook handling error:', error);
    throw error;
  }
}

async function handleSubscriptionChange(subscription) {
  const { customer, status, items } = subscription;
  const priceId = items.data[0].price.id;

  // Map price ID to plan tier
  const tierMap = {
    'price_H1234': 'pro',
    'price_H5678': 'enterprise'
    // Add your actual price IDs here
  };

  const tier = tierMap[priceId] || 'free';

  // Get user ID from customer
  const customer_data = await stripe.customers.retrieve(customer);
  const userId = customer_data.metadata.userId;

  // Update user's subscription status
  await supabase
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_status: status
    })
    .eq('id', userId);
}

async function handleSubscriptionCancelled(subscription) {
  const { customer } = subscription;
  const customer_data = await stripe.customers.retrieve(customer);
  const userId = customer_data.metadata.userId;

  await supabase
    .from('profiles')
    .update({
      subscription_tier: 'free',
      subscription_status: 'inactive'
    })
    .eq('id', userId);
}

module.exports = {
  createCheckoutSession,
  createPortalSession,
  handleWebhookEvent
};