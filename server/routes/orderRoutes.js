const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
  getDashboardStats,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all order routes
router.use(protect);

router.route('/')
  .post(createOrder)
  .get(authorize('admin'), getOrders);

router.route('/myorders').get(getMyOrders);
router.route('/dashboard/stats').get(authorize('admin'), getDashboardStats);

router.route('/:id').get(getOrderById);
router.route('/:id/pay').put(updateOrderToPaid);
router.route('/:id/deliver').put(authorize('admin'), updateOrderToDelivered);
router.route('/:id/status').put(authorize('admin'), updateOrderStatus);

module.exports = router;
