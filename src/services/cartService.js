import api from '../config/api';

const cartService = {
  // Get all cart items
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data.data;
  },

  // Alias for backward compatibility
  getCartItems: async () => {
    const cart = await cartService.getCart();
    return cart.items || [];
  },

  // Add to cart
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/cart', { productId, quantity });
    return response.data.data;
  },

  // Update cart item quantity
  updateCartItem: async (id, quantity) => {
    const response = await api.put(`/cart/${id}`, { quantity });
    return response.data.data;
  },

  // Update quantity (alias)
  updateCartQuantity: async (id, quantity) => {
    return cartService.updateCartItem(id, quantity);
  },

  // Remove from cart
  removeFromCart: async (id) => {
    const response = await api.delete(`/cart/${id}`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },
};

export default cartService;


