const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  mergeCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// Protect all cart routes
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.put('/quantity', updateCartQuantity);
router.post('/merge', mergeCart);
router.delete('/:productId', removeFromCart);

module.exports = router;
