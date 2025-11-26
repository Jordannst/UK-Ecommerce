import { createContext, useContext, useState, useEffect } from 'react';
import wishlistService from '../services/wishlistService';

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

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const items = await wishlistService.getWishlist();
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product) => {
    try {
      const newItem = await wishlistService.addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
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


