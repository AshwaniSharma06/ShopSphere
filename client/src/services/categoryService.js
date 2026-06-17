import api from './api';

const categoryService = {
  getCategories: async () => {
    const { data } = await api.get('/categories');
    return data;
  },
};

export default categoryService;
