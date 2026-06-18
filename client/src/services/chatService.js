import api from './api';

const chatService = {
  getActiveRooms: async () => {
    const { data } = await api.get('/chats/rooms');
    return data;
  },
  getChatHistory: async (chatId) => {
    const { data } = await api.get(`/chats/messages/${chatId}`);
    return data;
  },
};

export default chatService;
