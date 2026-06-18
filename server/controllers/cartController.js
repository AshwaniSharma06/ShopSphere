const User = require('../models/User');
const Product = require('../models/Product');

/**
 * Helper function to send populated cart response
 */
const sendPopulatedCart = async (userId, res) => {
  const user = await User.findById(userId).populate({
    path: 'cart.product',
    populate: { path: 'category' }
  });
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    cart: user.cart,
  });
};

/**
 * @desc    Get user's cart
 * @route   GET /api/v1/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    await sendPopulatedCart(req.user._id, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add product to cart
 * @route   POST /api/v1/cart
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      res.status(400);
      throw new Error('Product ID is required');
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    if (product.stock === 0) {
      res.status(400);
      throw new Error('Product is out of stock');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check if item already exists in user's cart
    const cartItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    let newQuantity = quantity;
    if (cartItemIndex > -1) {
      // Item exists, increase quantity
      newQuantity = user.cart[cartItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        res.status(400);
        throw new Error(`Cannot add more items. Maximum stock available is ${product.stock}`);
      }
      
      user.cart[cartItemIndex].quantity = newQuantity;
    } else {
      // Item does not exist, add new item
      if (quantity > product.stock) {
        res.status(400);
        throw new Error(`Cannot add more items. Maximum stock available is ${product.stock}`);
      }
      
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    await sendPopulatedCart(user._id, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update quantity of product in cart
 * @route   PUT /api/v1/cart/quantity
 * @access  Private
 */
const updateCartQuantity = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      res.status(400);
      throw new Error('Product ID and quantity are required');
    }

    if (quantity < 1) {
      res.status(400);
      throw new Error('Quantity must be at least 1');
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    if (quantity > product.stock) {
      res.status(400);
      throw new Error(`Maximum available stock is ${product.stock}`);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const cartItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartItemIndex === -1) {
      res.status(404);
      throw new Error('Product not in cart');
    }

    user.cart[cartItemIndex].quantity = quantity;
    await user.save();
    await sendPopulatedCart(user._id, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove product from cart
 * @route   DELETE /api/v1/cart/:productId
 * @access  Private
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();
    await sendPopulatedCart(user._id, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/v1/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.cart = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Merge guest cart with user cart
 * @route   POST /api/v1/cart/merge
 * @access  Private
 */
const mergeCart = async (req, res, next) => {
  try {
    const { cart } = req.body; // Array of { product: productId, quantity: number }

    if (!cart || !Array.isArray(cart)) {
      res.status(400);
      throw new Error('Invalid guest cart data');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    for (const guestItem of cart) {
      const { product: productId, quantity } = guestItem;
      if (!productId) continue;

      const product = await Product.findById(productId);
      if (!product) continue; // Skip if product doesn't exist

      const cartItemIndex = user.cart.findIndex(
        (item) => item.product.toString() === productId
      );

      if (cartItemIndex > -1) {
        // Merge quantity, cap at product stock
        const mergedQty = user.cart[cartItemIndex].quantity + quantity;
        user.cart[cartItemIndex].quantity = Math.min(mergedQty, product.stock);
      } else {
        // Add new item, cap at product stock
        user.cart.push({
          product: productId,
          quantity: Math.min(quantity, product.stock),
        });
      }
    }

    await user.save();
    await sendPopulatedCart(user._id, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  mergeCart,
};
