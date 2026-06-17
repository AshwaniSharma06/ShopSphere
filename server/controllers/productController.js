const Product = require('../models/Product');
const generateQR = require('../utils/generateQR');

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

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) query.category = category;

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
    const product = await Product.create(req.body);

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

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getTrendingProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
};
