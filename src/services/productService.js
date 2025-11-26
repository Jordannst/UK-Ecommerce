import api from '../config/api';

const productService = {
  // Get all products
  getAllProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data.data;
  },

  // Get single product
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  // Get similar products
  getSimilarProducts: async (id, limit = 4) => {
    const response = await api.get(`/products/${id}/similar`, {
      params: { limit }
    });
    return response.data.data;
  },

  // Create product (with file upload support)
  createProduct: async (productData) => {
    // If image is a File object, create FormData
    if (productData.image instanceof File || productData instanceof FormData) {
      const formData = productData instanceof FormData ? productData : new FormData();
      if (!(productData instanceof FormData)) {
        Object.keys(productData).forEach(key => {
          if (productData[key] !== null && productData[key] !== undefined) {
            formData.append(key, productData[key]);
          }
        });
      }
      const response = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    }
    
    const response = await api.post('/products', productData);
    return response.data.data;
  },

  // Update product (with file upload support)
  updateProduct: async (id, productData) => {
    // If image is a File object, create FormData
    if (productData.image instanceof File || productData instanceof FormData) {
      const formData = productData instanceof FormData ? productData : new FormData();
      if (!(productData instanceof FormData)) {
        Object.keys(productData).forEach(key => {
          if (productData[key] !== null && productData[key] !== undefined) {
            formData.append(key, productData[key]);
          }
        });
      }
      const response = await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    }
    
    const response = await api.put(`/products/${id}`, productData);
    return response.data.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Search products
  searchProducts: async (query) => {
    const response = await api.get('/products', {
      params: { search: query }
    });
    return response.data.data;
  },

  // Filter by category
  getProductsByCategory: async (categoryId) => {
    const response = await api.get('/products', {
      params: { categoryId }
    });
    return response.data.data;
  },
};

export default productService;


