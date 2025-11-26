import api from '../config/api';

// Transform wishlist item from backend (nested product) to flat structure for frontend
const transformWishlistItem = (item) => ({
  id: item.id,
  productId: item.productId,
  // Flatten product properties for frontend compatibility
  name: item.product?.name || '',
  price: item.product?.price || 0,
  image: item.product?.image || '',
  stock: item.product?.stock || 0,
  // Keep original product object if needed
  product: item.product
});

const wishlistService = {
  // Get all wishlist items - returns transformed items
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    const items = response.data.data || [];
    return items.map(transformWishlistItem);
  },

  // Add to wishlist - returns transformed item
  addToWishlist: async (productId) => {
    const response = await api.post('/wishlist', { productId });
    return transformWishlistItem(response.data.data);
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


