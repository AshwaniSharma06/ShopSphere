const Product = require('../models/Product');
const generateQR = require('../utils/generateQR');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');

/**
 * @desc    Get products with search, filter, sort, and pagination
 * @route   GET /api/v1/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      featured,
      trending,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Tokenized multi-word text search
    if (search) {
      const searchTerms = search.trim().split(/\s+/).filter(Boolean);
      if (searchTerms.length > 0) {
        query.$and = searchTerms.map((term) => ({
          $or: [
            { title: { $regex: term, $options: 'i' } },
            { description: { $regex: term, $options: 'i' } },
            { tags: { $regex: term, $options: 'i' } },
          ],
        }));
      }
    }

    // Category filter
    if (category) query.category = category;

    // Vendor filter
    if (req.query.vendor) query.vendor = req.query.vendor;

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) query.rating = { $gte: Number(rating) };

    // Featured / Trending filters
    if (featured === 'true') query.isFeatured = true;
    if (trending === 'true') query.isTrending = true;

    // Sort options
    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'name_asc') sortOption = { title: 1 };
    else if (sort === 'name_desc') sortOption = { title: -1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('reviews.user', 'name avatar');

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured products
 * @route   GET /api/v1/products/featured
 * @access  Public
 */
const getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = Math.min(20, Number(req.query.limit) || 8);
    const products = await Product.find({ isFeatured: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get trending products
 * @route   GET /api/v1/products/trending
 * @access  Public
 */
const getTrendingProducts = async (req, res, next) => {
  try {
    const limit = Math.min(20, Number(req.query.limit) || 8);
    const products = await Product.find({ isTrending: true })
      .populate('category', 'name slug')
      .sort({ rating: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/v1/products
 * @access  Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    if (req.user && req.user.role === 'vendor') {
      productData.vendor = req.user._id;
    }

    const product = await Product.create(productData);

    // Generate QR code for the product
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    product.qrCode = await generateQR(product._id, clientUrl);
    await product.save();

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/v1/products/:id
 * @access  Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Authorization check: Admin can edit any product. Vendor can only edit their own.
    if (req.user.role === 'vendor' && (!product.vendor || product.vendor.toString() !== req.user._id.toString())) {
      res.status(403);
      throw new Error('Not authorized to edit this product');
    }

    const allowedFields = [
      'title', 'description', 'category', 'price', 'discountPercent',
      'images', 'stock', 'isFeatured', 'isTrending', 'tags',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updated = await product.save();
    res.status(200).json({ success: true, product: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/v1/products/:id
 * @access  Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Authorization check: Admin can delete any. Vendor can only delete their own.
    if (req.user.role === 'vendor' && (!product.vendor || product.vendor.toString() !== req.user._id.toString())) {
      res.status(403);
      throw new Error('Not authorized to delete this product');
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a review to a product
 * @route   POST /api/v1/products/:id/reviews
 * @access  Authenticated
 */
const createProductReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;

    if (rating === undefined || rating === null || rating === '') {
      res.status(400);
      throw new Error('Rating is required');
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      res.status(400);
      throw new Error('Rating must be a number between 1 and 5');
    }

    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      res.status(400);
      throw new Error('Please provide a valid review comment');
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('You have already reviewed this product');
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      title: title || '',
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({ success: true, message: 'Review added' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get related product recommendations (same category or matching tags)
 * @route   GET /api/v1/products/:id/recommendations
 * @access  Public
 */
const getProductRecommendations = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Find products in the same category or matching tags (excluding self)
    const query = {
      _id: { $ne: product._id },
      $or: [
        { category: product.category },
        { tags: { $in: product.tags } }
      ]
    };

    const recommendations = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ rating: -1, numReviews: -1 })
      .limit(4)
      .lean();

    // Fallback if not enough matching products found: get top rated products
    if (recommendations.length < 4) {
      const excludeIds = [product._id, ...recommendations.map(r => r._id)];
      const fallback = await Product.find({ _id: { $nin: excludeIds } })
        .populate('category', 'name slug')
        .sort({ rating: -1 })
        .limit(4 - recommendations.length)
        .lean();
      recommendations.push(...fallback);
    }

    res.status(200).json({
      success: true,
      products: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get personalized product recommendations for homepage
 *          Supports both authenticated users (similarity to wishlist/orders) and guest fallbacks.
 * @route   GET /api/v1/products/recommendations
 * @access  Public
 */
const getPersonalizedRecommendations = async (req, res, next) => {
  try {
    let user = null;

    // Optional decode token if header present to support both guests and logged-in users
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id).populate('wishlist');
      } catch (err) {
        // Token invalid or expired, proceed in guest mode
      }
    }

    let recommendations = [];
    const preferenceCategoryIds = [];
    const preferenceTags = [];
    const excludeProductIds = [];

    if (user) {
      if (user.wishlist && user.wishlist.length > 0) {
        user.wishlist.forEach((p) => {
          if (p.category) preferenceCategoryIds.push(p.category.toString());
          if (p.tags) preferenceTags.push(...p.tags);
          excludeProductIds.push(p._id.toString());
        });
      }

      // Fetch user's orders to include category/tags from ordered items
      try {
        const orders = await Order.find({ user: user._id }).populate({
          path: 'orderItems.product',
          select: 'category tags'
        });
        orders.forEach((order) => {
          order.orderItems.forEach((item) => {
            if (item.product) {
              if (item.product.category) preferenceCategoryIds.push(item.product.category.toString());
              if (item.product.tags) preferenceTags.push(...item.product.tags);
              excludeProductIds.push(item.product._id.toString());
            }
          });
        });
      } catch (orderErr) {
        console.error('Error fetching user orders for recommendations:', orderErr);
      }
    }

    if (preferenceCategoryIds.length > 0 || preferenceTags.length > 0) {
      // De-duplicate lists
      const uniqueCategoryIds = [...new Set(preferenceCategoryIds)];
      const uniqueTags = [...new Set(preferenceTags)];
      const uniqueExcludeIds = [...new Set(excludeProductIds)];

      const query = {
        _id: { $nin: uniqueExcludeIds },
        $or: [
          { category: { $in: uniqueCategoryIds } },
          { tags: { $in: uniqueTags } }
        ]
      };

      recommendations = await Product.find(query)
        .populate('category', 'name slug')
        .sort({ rating: -1 })
        .limit(4)
        .lean();
    }

    // Fallback: If no recommendations yet (or guest mode), return highest-rated trending products
    if (recommendations.length < 4) {
      const excludeIds = recommendations.map((r) => r._id.toString());
      if (user && user.wishlist) {
        user.wishlist.forEach(item => excludeIds.push(item._id.toString()));
      }

      // Also exclude ordered product IDs
      excludeProductIds.forEach(id => excludeIds.push(id));

      const uniqueExcludeIds = [...new Set(excludeIds)];

      const fallback = await Product.find({ _id: { $nin: uniqueExcludeIds } })
        .populate('category', 'name slug')
        .sort({ rating: -1, isTrending: -1 })
        .limit(4 - recommendations.length)
        .lean();

      recommendations.push(...fallback);
    }

    res.status(200).json({
      success: true,
      products: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Vendor Stats
 * @route   GET /api/v1/products/vendor/stats
 * @access  Private (Vendor only)
 */
const getVendorStats = async (req, res, next) => {
  try {
    const vendorId = req.user._id;

    // 1. Get vendor's products
    const products = await Product.find({ vendor: vendorId });
    const productIds = products.map((p) => p._id);

    // Find out of stock count
    const outOfStockCount = products.filter((p) => p.stock === 0).length;

    // 2. Aggregate sales metrics for paid orders containing these products
    const orders = await Order.find({ isPaid: true });

    let totalSales = 0;
    let totalItemsSold = 0;
    const itemsList = [];

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (productIds.some((id) => id.toString() === item.product.toString())) {
          const itemSales = item.price * item.quantity;
          totalSales += itemSales;
          totalItemsSold += item.quantity;

          // Add to breakdown
          const matchingProduct = products.find(
            (p) => p._id.toString() === item.product.toString()
          );
          itemsList.push({
            title: matchingProduct ? matchingProduct.title : 'Deleted Product',
            price: item.price,
            quantity: item.quantity,
            total: itemSales,
            createdAt: order.createdAt,
          });
        }
      });
    });

    const commissionRate = req.user.vendorProfile?.commissionRate || 0.10;
    const commissionPaid = totalSales * commissionRate;
    const netEarnings = totalSales - commissionPaid;

    res.status(200).json({
      success: true,
      stats: {
        totalSales,
        totalItemsSold,
        commissionPaid,
        netEarnings,
        totalProducts: products.length,
        outOfStockProducts: outOfStockCount,
        recentSales: itemsList
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a product review as helpful
 * @route   POST /api/v1/products/:id/reviews/:reviewId/helpful
 * @access  Private
 */
const voteReviewHelpful = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    // Initialize helpfulUsers array if it doesn't exist
    if (!review.helpfulUsers) {
      review.helpfulUsers = [];
    }

    // Check if user already voted this review as helpful
    const alreadyVoted = review.helpfulUsers.find(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (alreadyVoted) {
      // Undo vote (toggle)
      review.helpfulUsers = review.helpfulUsers.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
      await product.save();
      return res.status(200).json({
        success: true,
        message: 'Helpful vote removed',
        helpfulVotes: review.helpfulVotes,
      });
    }

    // Add vote
    review.helpfulUsers.push(req.user._id);
    review.helpfulVotes = (review.helpfulVotes || 0) + 1;

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Review marked as helpful',
      helpfulVotes: review.helpfulVotes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get general statistics of products (avg price, min/max price, count)
 * @route   GET /api/v1/products/stats/summary
 * @access  Public
 */
const getProductStats = async (req, res, next) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalProducts: 0,
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        avgRating: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
  getProductStats,
};
