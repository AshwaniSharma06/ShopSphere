import api from './api';

const authService = {
  register: async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  getProfile: async (token) => {
    const { data } = await api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  updateProfile: async (profileData, token) => {
    const { data } = await api.put('/auth/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token, password) => {
    const { data } = await api.put(`/auth/reset-password/${token}`, { password });
    return data;
  },
};

export default authService;
