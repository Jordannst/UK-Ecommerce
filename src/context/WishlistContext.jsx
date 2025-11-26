import { createContext, useContext, useState, useEffect } from 'react';
import wishlistService from '../services/wishlistService';
import authService from '../services/authService';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist on mount only if user is authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      loadWishlist();
    }
  }, []);

  const loadWishlist = async () => {
    // Only load if user is authenticated
    if (!authService.isAuthenticated()) {
      setWishlistItems([]);
      return;
    }
    
    try {
      setLoading(true);
      const items = await wishlistService.getWishlist();
      setWishlistItems(items);
    } catch (error) {
      // If 401, user is not authenticated, just clear wishlist
      if (error.response?.status === 401) {
        setWishlistItems([]);
      } else {
        console.error('Error loading wishlist:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product) => {
    try {
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        throw new Error('Please login to add items to wishlist');
      }

      // Fix: pass productId as parameter, not an object
      const newItem = await wishlistService.addToWishlist(product.id);
      setWishlistItems([...wishlistItems, newItem]);
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      await wishlistService.removeFromWishlist(itemId);
      setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const getWishlistItemByProductId = (productId) => {
    return wishlistItems.find(item => item.productId === productId);
  };

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistItemByProductId,
    refreshWishlist: loadWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};


