import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { MessageSquare, X, Send, User, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';

export default function ChatWidget() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [chatId, setChatId] = useState('');
  const [guestName, setGuestName] = useState('Guest Customer');
  const [loadingHistory, setLoadingHistory] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 1. Establish session identifiers (User ID vs Guest UUID)
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      setChatId(user._id.toString());
      setGuestName(user.name);
    } else {
      let storedGuestId = localStorage.getItem('shopsphere_guest_id');
      if (!storedGuestId) {
        storedGuestId = `guest_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('shopsphere_guest_id', storedGuestId);
      }
      setChatId(storedGuestId);
      setGuestName('Guest Customer');
    }
  }, [user, isAuthenticated]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAdminTyping]);

  // 2. Initialize WebSocket client connection
  useEffect(() => {
    if (!chatId) return;

    // Connect to WebSocket server (host URL matches server)
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const socket = io(backendUrl);
    socketRef.current = socket;

    // Join room
    socket.emit('join_room', {
      chatId,
      role: isAuthenticated ? 'customer' : 'guest',
    });

    // Listeners
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socket.on('typing_status', ({ isTyping, senderRole }) => {
      if (senderRole === 'admin') {
        setIsAdminTyping(isTyping);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [chatId, isOpen, isAuthenticated]);

  // 3. Load message history when widget opens
  useEffect(() => {
    const loadHistory = async () => {
      if (isOpen && chatId) {
        try {
          setLoadingHistory(true);
          const data = await chatService.getChatHistory(chatId);
          if (data.success) {
            setMessages(data.messages);
            setUnreadCount(0); // clear unread count on open
            socketRef.current?.emit('read_chat', { chatId });
          }
        } catch (err) {
          console.error('Failed to load chat history:', err);
        } finally {
          setLoadingHistory(false);
        }
      }
    };
    loadHistory();
  }, [isOpen, chatId]);

  // 4. Handle text inputs & typing states
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    // Emit typing indicator
    if (socketRef.current) {
      socketRef.current.emit('typing', {
        chatId,
        isTyping: true,
        senderRole: isAuthenticated ? 'customer' : 'guest',
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('typing', {
          chatId,
          isTyping: false,
          senderRole: isAuthenticated ? 'customer' : 'guest',
        });
      }, 1500);
    }
  };

  // 5. Send message payload
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageData = {
      chatId,
      senderId: isAuthenticated ? user._id : null,
      senderName: guestName,
      senderRole: isAuthenticated ? 'customer' : 'guest',
      message: inputText.trim(),
      isAdmin: false,
    };

    if (socketRef.current) {
      socketRef.current.emit('send_message', messageData);
      // Turn off typing indicator immediately
      socketRef.current.emit('typing', {
        chatId,
        isTyping: false,
        senderRole: isAuthenticated ? 'customer' : 'guest',
      });
    }

    setInputText('');
  };

  if (user && user.role === 'admin') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-gradient-to-tr from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 focus:outline-none relative"
        aria-label="Toggle chat widget"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] h-5 w-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-Up Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-18 right-0 w-[350px] sm:w-[380px] h-[500px] bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200/60 dark:border-surface-800/60 flex flex-col overflow-hidden glass-card z-50"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
                <div>
                  <h4 className="font-bold text-sm">ShopSphere Support</h4>
                  <p className="text-[10px] text-primary-100 font-semibold uppercase tracking-wider">Online / Active</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-50/50 dark:bg-surface-950/20 scrollbar-thin">
              {loadingHistory ? (
                <div className="h-full flex items-center justify-center flex-col space-y-2 text-surface-400">
                  <RefreshCw className="h-5 w-5 animate-spin text-primary-500" />
                  <span className="text-xs font-medium">Connecting chat logs...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="h-12 w-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h5 className="text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider">How can we help?</h5>
                  <p className="text-[11px] text-surface-400 leading-relaxed max-w-[200px]">
                    Welcome! Drop us a line below to start chatting with our customer support team in real-time.
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = !msg.isAdmin;
                  return (
                    <div
                      key={msg._id || i}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                        isMe
                          ? 'bg-primary-600 text-white rounded-tr-none shadow-sm'
                          : 'bg-white dark:bg-surface-850 text-surface-800 dark:text-surface-150 border border-surface-200/50 dark:border-surface-800/50 rounded-tl-none shadow-sm'
                      }`}>
                        {!isMe && (
                          <span className="block text-[8px] font-bold text-primary-500 dark:text-primary-400 uppercase tracking-wide mb-1">
                            {msg.senderName} (Support)
                          </span>
                        )}
                        <p>{msg.message}</p>
                        <span className={`block text-[8px] mt-1 text-right ${isMe ? 'text-primary-200' : 'text-surface-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Live typing indicator */}
              {isAdminTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-surface-850 border border-surface-200/50 dark:border-surface-800/50 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1">
                    <span className="text-[8px] font-bold text-primary-500 uppercase tracking-wider mr-1">Admin typing</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer Footer */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white dark:bg-surface-900 border-t border-surface-200/60 dark:border-surface-800/60 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 text-xs input-field py-2 bg-surface-50 dark:bg-surface-950 focus:ring-1 border-0"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 btn-primary rounded-xl shrink-0 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
