const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  registerVendor,
  approveVendor,
  getVendors,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes
router.route('/profile').get(protect, getProfile).put(protect, updateProfile);

// Vendor endpoints
router.post('/vendor-register', protect, registerVendor);
router.put('/vendor-approve/:id', protect, authorize('admin'), approveVendor);
router.get('/vendors', protect, authorize('admin'), getVendors);

module.exports = router;
