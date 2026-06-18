const User = require('../models/User');
const Product = require('../models/Product');

/**
 * Helper function to send populated wishlist response
 */
const sendPopulatedWishlist = async (userId, res) => {
  const user = await User.findById(userId).populate({
    path: 'wishlist',
    populate: { path: 'category' }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    wishlist: user.wishlist,
  });
};

/**
 * @desc    Get user's wishlist
 * @route   GET /api/v1/wishlist
 * @access  Private
 */
const getWishlist = async (req, res, next) => {
  try {
    await sendPopulatedWishlist(req.user._id, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add product to wishlist
 * @route   POST /api/v1/wishlist
 * @access  Private
 */
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      res.status(400);
      throw new Error('Product ID is required');
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check if product already in wishlist
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    await sendPopulatedWishlist(user._id, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/v1/wishlist/:productId
 * @access  Private
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );

    await user.save();
    await sendPopulatedWishlist(user._id, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle product in wishlist (add if not present, remove if present)
 * @route   POST /api/v1/wishlist/toggle
 * @access  Private
 */
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      res.status(400);
      throw new Error('Product ID is required');
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      // Already in wishlist, remove it
      user.wishlist.splice(index, 1);
    } else {
      // Not in wishlist, add it
      user.wishlist.push(productId);
    }

    await user.save();
    await sendPopulatedWishlist(user._id, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Merge guest wishlist with user wishlist
 * @route   POST /api/v1/wishlist/merge
 * @access  Private
 */
const mergeWishlist = async (req, res, next) => {
  try {
    const { wishlist } = req.body; // Array of product IDs

    if (!wishlist || !Array.isArray(wishlist)) {
      res.status(400);
      throw new Error('Invalid guest wishlist data');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Merge only unique valid product IDs
    for (const productId of wishlist) {
      if (!productId) continue;

      const product = await Product.findById(productId);
      if (!product) continue; // Skip if invalid product

      const exists = user.wishlist.some(
        (id) => id.toString() === productId
      );

      if (!exists) {
        user.wishlist.push(productId);
      }
    }

    await user.save();
    await sendPopulatedWishlist(user._id, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  mergeWishlist,
};
