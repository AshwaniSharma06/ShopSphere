const express = require('express');
const router = express.Router();
const {
  getActiveRooms,
  getChatHistory,
} = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get active chat rooms (Admin only)
router.get('/rooms', protect, authorize('admin'), getActiveRooms);

// Get chat messages history (accessible by admin, user owner, or guest chatId)
router.get('/messages/:chatId', getChatHistory);

module.exports = router;
