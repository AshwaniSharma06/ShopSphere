import api from './api';

const wishlistService = {
  getWishlist: async () => {
    const res = await api.get('/wishlist');
    return res.data;
  },
  
  addToWishlist: async (productId) => {
    const res = await api.post('/wishlist', { productId });
    return res.data;
  },
  
  toggleWishlist: async (productId) => {
    const res = await api.post('/wishlist/toggle', { productId });
    return res.data;
  },
  
  removeFromWishlist: async (productId) => {
    const res = await api.delete(`/wishlist/${productId}`);
    return res.data;
  },
  
  mergeWishlist: async (productIds) => {
    const res = await api.post('/wishlist/merge', { wishlist: productIds });
    return res.data;
  },
};

export default wishlistService;
