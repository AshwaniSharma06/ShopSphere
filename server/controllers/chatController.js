const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * @desc    Get all active chat rooms
 * @route   GET /api/v1/chats/rooms
 * @access  Private/Admin
 */
const getActiveRooms = async (req, res, next) => {
  try {
    const rooms = await ChatRoom.find({ status: 'active' })
      .populate('user', 'name email avatar')
      .sort({ lastMessageTime: -1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get chat message history for a specific chatId
 * @route   GET /api/v1/chats/messages/:chatId
 * @access  Public / Private (Admin or matching User)
 */
const getChatHistory = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      res.status(400);
      throw new Error('Please provide a chatId');
    }

    // Attempt to decode optional JWT token from headers
    let user = null;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        // Ignore parsing errors, user remains null
      }
    }

    // Access control:
    // 1. Admin can see any chat.
    // 2. Customers can only see their own chat (chatId === user._id).
    // 3. Guests can see their own guest chat (chatId starts with 'guest_').
    const isAdmin = user && user.role === 'admin';
    const isOwner = user && user._id.toString() === chatId;
    const isGuestChat = chatId.startsWith('guest_');

    if (!isAdmin && !isOwner && !isGuestChat) {
      res.status(403);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat history',
      });
    }

    const messages = await ChatMessage.find({ chatId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveRooms,
  getChatHistory,
};
