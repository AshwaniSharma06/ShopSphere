import api from './api';

const productService = {
  getProducts: async (params = {}) => {
    const { data } = await api.get('/products', { params });
    return data;
  },

  getProductById: async (id) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  getFeatured: async (limit = 8) => {
    const { data } = await api.get('/products/featured', { params: { limit } });
    return data;
  },

  getTrending: async (limit = 8) => {
    const { data } = await api.get('/products/trending', { params: { limit } });
    return data;
  },

  createReview: async (productId, reviewData) => {
    const { data } = await api.post(`/products/${productId}/reviews`, reviewData);
    return data;
  },
};

export default productService;
