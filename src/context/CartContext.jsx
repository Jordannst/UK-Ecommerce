import { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../services/cartService';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const items = await cartService.getCartItems();
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      // Check if product already in cart
      const existingItem = cartItems.find(item => item.productId === product.id);
      
      if (existingItem) {
        // Update quantity
        const updatedItem = await cartService.updateCartQuantity(
          existingItem.id,
          existingItem.quantity + quantity
        );
        setCartItems(cartItems.map(item => 
          item.id === existingItem.id ? updatedItem : item
        ));
      } else {
        // Add new item
        const newItem = await cartService.addToCart({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        });
        setCartItems([...cartItems, newItem]);
      }
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }
    
    try {
      const updatedItem = await cartService.updateCartQuantity(itemId, quantity);
      setCartItems(cartItems.map(item => 
        item.id === itemId ? updatedItem : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await cartService.removeFromCart(itemId);
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
    refreshCart: loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};


