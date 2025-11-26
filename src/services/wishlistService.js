import api from '../config/api';

const wishlistService = {
  // Get all wishlist items
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data.data;
  },

  // Add to wishlist
  addToWishlist: async (productId) => {
    const response = await api.post('/wishlist', { productId });
    return response.data.data;
  },

  // Remove from wishlist
  removeFromWishlist: async (id) => {
    const response = await api.delete(`/wishlist/${id}`);
    return response.data;
  },

  // Clear wishlist
  clearWishlist: async () => {
    const response = await api.delete('/wishlist');
    return response.data;
  },

  // Check if product is in wishlist
  checkWishlist: async (productId) => {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data.data.inWishlist;
  },

  // Alias for backward compatibility
  isInWishlist: async (productId) => {
    try {
      return await wishlistService.checkWishlist(productId);
    } catch (error) {
      return false;
    }
  },
};

export default wishlistService;


