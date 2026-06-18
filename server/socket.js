const socketIO = require('socket.io');
const ChatRoom = require('./models/ChatRoom');
const ChatMessage = require('./models/ChatMessage');

const setupSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: '*', // Allows connections from development clients
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join room
    socket.on('join_room', ({ chatId, role }) => {
      socket.join(chatId);
      console.log(`👤 Socket ${socket.id} joined room: ${chatId}`);

      // Admins join an administrative notification room as well
      if (role === 'admin') {
        socket.join('admin_room');
        console.log(`👑 Admin joined admin_room: ${socket.id}`);
      }
    });

    // Handle messages
    socket.on(
      'send_message',
      async ({ chatId, senderId, senderName, senderRole, message, isAdmin }) => {
        try {
          // 1. Create the persistent ChatMessage record
          const newMessage = await ChatMessage.create({
            chatId,
            sender: senderRole !== 'guest' ? senderId : null,
            senderName,
            senderRole,
            message,
            isAdmin: !!isAdmin,
          });

          // 2. Upsert/Update the ChatRoom metadata
          const room = await ChatRoom.findOneAndUpdate(
            { chatId },
            {
              lastMessage: message,
              lastMessageTime: new Date(),
              status: 'active',
              $setOnInsert: {
                user: senderRole === 'customer' ? senderId : null,
                guestName: senderRole === 'guest' ? senderName : 'Guest Customer',
              },
              $inc: { unreadCount: isAdmin ? 0 : 1 },
            },
            { new: true, upsert: true }
          ).populate('user', 'name email avatar');

          // If admin replies, clear the unread badge
          if (isAdmin) {
            room.unreadCount = 0;
            await room.save();
          }

          // 3. Emit message back to room users (sender & recipient)
          io.to(chatId).emit('receive_message', newMessage);

          // 4. Update the Admin panel threads list in real-time
          io.to('admin_room').emit('room_updated', room);
        } catch (error) {
          console.error('⚠️ Socket send_message error:', error.message);
        }
      }
    );

    // Read chat / mark room unread count as 0
    socket.on('read_chat', async ({ chatId }) => {
      try {
        await ChatRoom.findOneAndUpdate({ chatId }, { unreadCount: 0 });
        io.to('admin_room').emit('room_read', { chatId });
      } catch (error) {
        console.error('⚠️ Socket read_chat error:', error.message);
      }
    });

    // Handle live typing states
    socket.on('typing', ({ chatId, isTyping, senderRole }) => {
      socket.to(chatId).emit('typing_status', { chatId, isTyping, senderRole });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = setupSocket;
