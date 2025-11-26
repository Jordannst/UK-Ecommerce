import api from '../config/api';

const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data.data;
  },

  // Get single category
  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data.data;
  },

  // Get category by slug
  getCategoryBySlug: async (slug) => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data.data;
  },

  // Create category
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data.data;
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data.data;
  },

  // Delete category
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;


