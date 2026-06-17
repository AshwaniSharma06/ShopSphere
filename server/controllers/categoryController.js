const Category = require('../models/Category');

/**
 * @desc    Get all categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/v1/categories
 * @access  Admin
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, image, description } = req.body;

    const existing = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      res.status(400);
      throw new Error('Category already exists');
    }

    const category = await Category.create({ name, image, description });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a category
 * @route   PUT /api/v1/categories/:id
 * @access  Admin
 */
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    category.name = req.body.name || category.name;
    category.image = req.body.image || category.image;
    category.description = req.body.description || category.description;

    const updated = await category.save();
    res.status(200).json({ success: true, category: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/v1/categories/:id
 * @access  Admin
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
