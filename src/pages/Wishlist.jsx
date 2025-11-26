import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState({});

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = async (item) => {
    setAddingToCart({ ...addingToCart, [item.id]: true });
    
    const product = {
      id: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
    };
    
    await addToCart(product);
    setAddingToCart({ ...addingToCart, [item.id]: false });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-4">
                <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <svg
            className="w-24 h-24 text-gray-400 mx-auto mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-8">Save your favorite items for later!</p>
          <Link to="/shop" className="btn-primary inline-block">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">{wishlistItems.length} items saved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <div key={item.id} className="card p-4 relative group">
            {/* Remove Button */}
            <button
              onClick={() => removeFromWishlist(item.id)}
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors"
            >
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Product Image */}
            <Link to={`/product/${item.productId}`}>
              <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>

            {/* Product Info */}
            <div className="space-y-3">
              <Link
                to={`/product/${item.productId}`}
                className="font-semibold text-gray-900 line-clamp-2 hover:text-unklab-blue transition-colors block"
              >
                {item.name}
              </Link>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-unklab-blue">
                  {formatPrice(item.price)}
                </span>
              </div>

              <button
                onClick={() => handleAddToCart(item)}
                disabled={addingToCart[item.id]}
                className="btn-primary w-full text-sm disabled:opacity-50"
              >
                {addingToCart[item.id] ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;


