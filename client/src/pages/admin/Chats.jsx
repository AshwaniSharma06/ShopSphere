const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, ArrowLeft, RefreshCw, User, ShieldAlert, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';

export default function Chats() {
  const { user: adminUser } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isCustomerTyping]);

  // 1. Fetch active chat rooms on mount
  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const data = await chatService.getActiveRooms();
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.error('Failed to load chat rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // 2. Initialize socket connection
  useEffect(() => {
    const socket = io(VITE_BACKEND_URL);
    socketRef.current = socket;

    socket.emit('join_room', {
      chatId: 'admin_room',
      role: 'admin',
    });

    // Listeners
    socket.on('room_updated', (updatedRoom) => {
      setRooms((prevRooms) => {
        // Check if room exists in list
        const exists = prevRooms.some((r) => r.chatId === updatedRoom.chatId);
        if (exists) {
          return prevRooms
            .map((r) => (r.chatId === updatedRoom.chatId ? updatedRoom : r))
            .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
        } else {
          return [updatedRoom, ...prevRooms];
        }
      });
    });

    socket.on('room_read', ({ chatId }) => {
      setRooms((prevRooms) =>
        prevRooms.map((r) => (r.chatId === chatId ? { ...r, unreadCount: 0 } : r))
      );
    });

    socket.on('receive_message', (msg) => {
      // Append message if it belongs to selected room
      if (selectedRoom && msg.chatId === selectedRoom.chatId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on('typing_status', ({ chatId, isTyping, senderRole }) => {
      if (selectedRoom && chatId === selectedRoom.chatId && senderRole !== 'admin') {
        setIsCustomerTyping(isTyping);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedRoom]);

  // 3. Load messages when selecting a chat room
  useEffect(() => {
    if (!selectedRoom) return;

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        setIsCustomerTyping(false);
        const data = await chatService.getChatHistory(selectedRoom.chatId);
        if (data.success) {
          setMessages(data.messages);
          // Mark room as read locally
          setRooms((prevRooms) =>
            prevRooms.map((r) => (r.chatId === selectedRoom.chatId ? { ...r, unreadCount: 0 } : r))
          );
          // Emit socket read update
          socketRef.current?.emit('read_chat', { chatId: selectedRoom.chatId });
          socketRef.current?.emit('join_room', { chatId: selectedRoom.chatId, role: 'admin' });
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedRoom]);

  // 4. Handle text inputs & typing states
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (socketRef.current && selectedRoom) {
      socketRef.current.emit('typing', {
        chatId: selectedRoom.chatId,
        isTyping: true,
        senderRole: 'admin',
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('typing', {
          chatId: selectedRoom.chatId,
          isTyping: false,
          senderRole: 'admin',
        });
      }, 1500);
    }
  };

  // 5. Send message payload
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedRoom) return;

    const messageData = {
      chatId: selectedRoom.chatId,
      senderId: adminUser._id,
      senderName: adminUser.name,
      senderRole: 'admin',
      message: inputText.trim(),
      isAdmin: true,
    };

    if (socketRef.current) {
      socketRef.current.emit('send_message', messageData);
      socketRef.current.emit('typing', {
        chatId: selectedRoom.chatId,
        isTyping: false,
        senderRole: 'admin',
      });
    }

    setInputText('');
  };

  return (
    <div className="container-custom py-10 h-[85vh] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center pb-5 border-b border-surface-200 dark:border-surface-800">
        <div>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white">
            Support Chat Console
          </h1>
        </div>
        <button
          onClick={fetchRooms}
          className="p-2.5 rounded-xl border border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-850 transition-colors"
          title="Refresh active rooms"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Live Chat Panel */}
      <div className="flex-1 mt-6 grid grid-cols-1 md:grid-cols-12 rounded-2xl border border-surface-200/60 dark:border-surface-800/60 bg-white dark:bg-surface-900 overflow-hidden shadow-sm h-[70vh]">
        {/* Left Pane: Chats list (4 cols) */}
        <div className="md:col-span-4 border-r border-surface-200/60 dark:border-surface-800/60 flex flex-col h-full bg-surface-50/20 dark:bg-surface-950/10">
          <div className="p-4 border-b border-surface-200/50 dark:border-surface-800/50">
            <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider">Active Conversations</h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-850/80 scrollbar-thin">
            {loadingRooms ? (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-2 text-surface-400">
                <RefreshCw className="h-6 w-6 animate-spin text-primary-500" />
                <span className="text-xs font-medium">Loading chat threads...</span>
              </div>
            ) : rooms.length === 0 ? (
              <div className="py-20 text-center p-6 space-y-2 text-surface-450">
                <MessageSquare className="h-10 w-10 mx-auto text-surface-300" />
                <p className="text-xs font-bold uppercase tracking-wider text-surface-700 dark:text-surface-300">All Quiet</p>
                <p className="text-[11px] text-surface-400 leading-relaxed">No customers are online or active in chat rooms right now.</p>
              </div>
            ) : (
              rooms.map((room) => {
                const isActive = selectedRoom && selectedRoom.chatId === room.chatId;
                const isGuest = room.chatId.startsWith('guest_');
                const displayName = isGuest ? room.guestName : room.user?.name || 'Customer';

                return (
                  <div
                    key={room.chatId}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-4 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-850/60 transition-colors flex items-start gap-3.5 relative ${
                      isActive ? 'bg-primary-50/10 dark:bg-primary-950/15 border-l-4 border-primary-500 pl-3' : ''
                    }`}
                  >
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-surface-150 to-surface-250 dark:from-surface-800 dark:to-surface-750 flex items-center justify-center text-surface-600 dark:text-surface-300 shrink-0">
                      <User className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-xs font-bold text-surface-900 dark:text-white truncate">
                          {displayName}
                        </h4>
                        <span className="text-[9px] text-surface-400 font-medium whitespace-nowrap">
                          {new Date(room.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-surface-450 truncate pr-4">
                        {room.lastMessage || 'No messages yet'}
                      </p>
                      <div className="flex gap-2 items-center">
                        <span className={`inline-block text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          isGuest
                            ? 'bg-surface-150 text-surface-600 dark:bg-surface-800 dark:text-surface-350'
                            : 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                        }`}>
                          {isGuest ? 'Guest' : 'Customer'}
                        </span>
                      </div>
                    </div>

                    {room.unreadCount > 0 && !isActive && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[9px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center animate-scale-in">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Message log & input (8 cols) */}
        <div className="md:col-span-8 flex flex-col h-full bg-white dark:bg-surface-900">
          {selectedRoom ? (
            <>
              {/* Selected chat room header */}
              <div className="p-4 border-b border-surface-200/50 dark:border-surface-800/50 flex items-center justify-between shadow-sm bg-surface-50/10 dark:bg-surface-950/5">
                <div>
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">
                    {selectedRoom.chatId.startsWith('guest_') ? selectedRoom.guestName : selectedRoom.user?.name || 'Customer'}
                  </h3>
                  <p className="text-[10px] text-surface-400 font-medium">Session ID: <span className="font-mono">{selectedRoom.chatId}</span></p>
                </div>
              </div>

              {/* Message History list */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-surface-50/30 dark:bg-surface-950/10 scrollbar-thin">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center flex-col space-y-2 text-surface-400">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary-500" />
                    <span className="text-xs font-medium">Retrieving transcripts...</span>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.isAdmin;
                    return (
                      <div
                        key={msg._id || i}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed ${
                          isMe
                            ? 'bg-primary-600 text-white rounded-tr-none shadow-sm'
                            : 'bg-white dark:bg-surface-850 text-surface-800 dark:text-surface-150 border border-surface-200/50 dark:border-surface-800/50 rounded-tl-none shadow-sm'
                        }`}>
                          {!isMe && (
                            <span className="block text-[8px] font-bold text-primary-500 dark:text-primary-400 uppercase tracking-wide mb-1">
                              {msg.senderName}
                            </span>
                          )}
                          <p>{msg.message}</p>
                          <span className={`block text-[8px] mt-1 text-right ${isMe ? 'text-primary-200' : 'text-surface-400'} flex items-center justify-end gap-0.5`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && <CheckCheck className="h-3 w-3 inline" />}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Customer Typing Dot alert */}
                {isCustomerTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-surface-850 border border-surface-200/50 dark:border-surface-800/50 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1">
                      <span className="text-[8px] font-bold text-primary-500 uppercase tracking-wider mr-1">Customer typing</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input composer box */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white dark:bg-surface-900 border-t border-surface-200/60 dark:border-surface-800/60 flex items-center gap-3"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder="Type a reply..."
                  className="flex-1 text-xs input-field py-2.5 bg-surface-50 dark:bg-surface-950 focus:ring-1 border-0"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 btn-primary rounded-xl shrink-0 disabled:opacity-40"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3.5 text-surface-400">
              <div className="h-16 w-16 rounded-2xl bg-surface-50 dark:bg-surface-850 border border-surface-200/50 dark:border-surface-800/50 flex items-center justify-center text-surface-300">
                <MessageSquare className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider">No Room Selected</h4>
                <p className="text-[11px] text-surface-400 leading-relaxed max-w-[260px] mt-1.5">
                  Pick a conversation thread from the left menu panel to view transaction history and start chatting in real-time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
