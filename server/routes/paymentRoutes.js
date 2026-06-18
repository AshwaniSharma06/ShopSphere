const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  handleStripeWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Create payment intent - Protected customer route
router.post('/intent', protect, createPaymentIntent);

// Webhook listener - Public route (receives raw stream from Stripe)
router.post('/webhook', handleStripeWebhook);

module.exports = router;
