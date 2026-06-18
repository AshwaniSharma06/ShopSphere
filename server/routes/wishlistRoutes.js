const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  mergeWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

// Protect all wishlist routes
router.use(protect);

router.route('/')
  .get(getWishlist)
  .post(addToWishlist);

router.post('/toggle', toggleWishlist);
router.post('/merge', mergeWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
