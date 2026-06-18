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
  getProductRecommendations,
  getPersonalizedRecommendations,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Static routes must come before parameterized routes
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/recommendations', getPersonalizedRecommendations);

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.post('/:id/reviews', protect, createProductReview);
router.get('/:id/recommendations', getProductRecommendations);

module.exports = router;
