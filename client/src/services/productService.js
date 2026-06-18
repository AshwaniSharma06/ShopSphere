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

  getRecommendations: async () => {
    const { data } = await api.get('/products/recommendations');
    return data;
  },

  getProductRecommendations: async (productId) => {
    const { data } = await api.get(`/products/${productId}/recommendations`);
    return data;
  },

  createProduct: async (productData) => {
    const { data } = await api.post('/products', productData);
    return data;
  },

  updateProduct: async (id, productData) => {
    const { data } = await api.put(`/products/${id}`, productData);
    return data;
  },

  deleteProduct: async (id) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },
};

export default productService;
