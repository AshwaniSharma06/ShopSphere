const Order = require('../models/Order');

/**
 * @desc    Create Stripe Payment Intent
 * @route   POST /api/v1/payments/intent
 * @access  Private
 */
const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400);
      throw new Error('Please provide an orderId');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check if Stripe configuration is present
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('⚠️ Stripe credentials missing. Running in payment simulation mode.');
      return res.status(200).json({
        success: true,
        isSimulated: true,
        clientSecret: `PAY_INTENT_SIMULATED_SECRET_${order._id}_${Date.now()}`,
        publishableKey: 'pk_test_simulated_key_shopsphere',
        amount: order.totalPrice,
      });
    }

    // Real Stripe Integration
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const amountInCents = Math.round(order.totalPrice * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'inr',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user?._id?.toString() || 'guest',
      },
    });

    res.status(200).json({
      success: true,
      isSimulated: false,
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      amount: order.totalPrice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Handle Stripe Webhook Notifications
 * @route   POST /api/v1/payments/webhook
 * @access  Public
 */
const handleStripeWebhook = async (req, res, next) => {
  let event;

  // Parse raw buffer to JSON if necessary
  if (Buffer.isBuffer(req.body)) {
    try {
      event = JSON.parse(req.body.toString('utf8'));
    } catch (err) {
      event = req.body;
    }
  } else {
    event = req.body;
  }

  // Verify signature if webhook secret is configured
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    
    try {
      event = stripe.webhooks.constructEvent(
        req.body, // raw buffer
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  // Handle successful payments
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;

    if (orderId) {
      try {
        const order = await Order.findById(orderId);
        if (order) {
          order.isPaid = true;
          order.paidAt = Date.now();
          order.status = 'Processing';
          order.paymentResult = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: new Date().toISOString(),
            email_address: paymentIntent.receipt_email || 'paid@stripe.com',
          };
          await order.save();
          console.log(`✅ Order ${orderId} successfully marked as PAID via Stripe Webhook.`);
        } else {
          console.warn(`⚠️ Webhook order not found in DB: ${orderId}`);
        }
      } catch (err) {
        console.error(`⚠️ Webhook order update failed:`, err.message);
        return next(err);
      }
    }
  }

  res.status(200).json({ received: true });
};

module.exports = {
  createPaymentIntent,
  handleStripeWebhook,
};
