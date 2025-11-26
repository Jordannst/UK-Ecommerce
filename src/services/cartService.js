import api from '../config/api';

// Transform cart item from backend (nested product) to flat structure for frontend
const transformCartItem = (item) => ({
  id: item.id,
  productId: item.productId,
  quantity: item.quantity,
  // Flatten product properties for frontend compatibility
  name: item.product?.name || '',
  price: item.product?.price || 0,
  image: item.product?.image || '',
  stock: item.product?.stock || 0,
  // Keep original product object if needed
  product: item.product
});

const cartService = {
  // Get all cart items
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data.data;
  },

  // Alias for backward compatibility - transforms items to flat structure
  getCartItems: async () => {
    const cart = await cartService.getCart();
    const items = cart.items || [];
    return items.map(transformCartItem);
  },

  // Add to cart - returns transformed item
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/cart', { productId, quantity });
    return transformCartItem(response.data.data);
  },

  // Update cart item quantity - returns transformed item
  updateCartItem: async (id, quantity) => {
    const response = await api.put(`/cart/${id}`, { quantity });
    return transformCartItem(response.data.data);
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


