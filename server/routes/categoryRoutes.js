const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/v1/categories
 * @desc    Get all categories ordered alphabetically by name
 * @access  Public
 */
router.route('/')
  .get(getCategories);

/**
 * @route   POST /api/v1/categories
 * @desc    Create a new category
 * @access  Private/Admin
 */
router.route('/')
  .post(protect, authorize('admin'), createCategory);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Update an existing category by ID
 * @access  Private/Admin
 */
router.route('/:id')
  .put(protect, authorize('admin'), updateCategory);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete a category by ID
 * @access  Private/Admin
 */
router.route('/:id')
  .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;
