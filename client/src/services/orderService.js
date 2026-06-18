import api from './api';

const orderService = {
  createOrder: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },
  
  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  
  payOrder: async (id, paymentResult) => {
    const res = await api.put(`/orders/${id}/pay`, paymentResult);
    return res.data;
  },
  
  getMyOrders: async () => {
    const res = await api.get('/orders/myorders');
    return res.data;
  },

  getOrders: async () => {
    const res = await api.get('/orders');
    return res.data;
  },

  updateOrderStatus: async (id, status) => {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data;
  },

  getDashboardStats: async () => {
    const res = await api.get('/orders/dashboard/stats');
    return res.data;
  },
};

export default orderService;
