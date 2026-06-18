import api from './api';

const paymentService = {
  createPaymentIntent: async (orderId) => {
    const { data } = await api.post('/payments/intent', { orderId });
    return data;
  },
};

export default paymentService;
