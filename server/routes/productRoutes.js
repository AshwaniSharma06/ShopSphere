const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getTrendingProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  voteReviewHelpful,
  getProductRecommendations,
  getPersonalizedRecommendations,
  getVendorStats,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Static routes must come before parameterized routes
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/recommendations', getPersonalizedRecommendations);
router.get('/vendor/stats', protect, authorize('vendor'), getVendorStats);

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin', 'vendor'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('admin', 'vendor'), updateProduct)
  .delete(protect, authorize('admin', 'vendor'), deleteProduct);

router.post('/:id/reviews', protect, createProductReview);
router.post('/:id/reviews/:reviewId/helpful', protect, voteReviewHelpful);
router.get('/:id/recommendations', getProductRecommendations);

module.exports = router;
