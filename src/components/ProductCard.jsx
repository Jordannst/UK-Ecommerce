import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, getWishlistItemByProductId } = useWishlist();
  const toast = useToast();

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    const success = await addToCart(product);
    if (success) {
      toast.success(`${product.name} ditambahkan ke keranjang! 🛒`);
    } else {
      toast.error('Silakan login terlebih dahulu');
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    if (inWishlist) {
      const wishlistItem = getWishlistItemByProductId(product.id);
      if (wishlistItem) {
        await removeFromWishlist(wishlistItem.id);
        toast.info(`${product.name} dihapus dari wishlist`);
      }
    } else {
      const success = await addToWishlist(product);
      if (success) {
        toast.success(`${product.name} ditambahkan ke wishlist! ❤️`);
      } else {
        toast.error('Silakan login terlebih dahulu');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="card p-4 relative overflow-hidden">
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform duration-200"
          title={inWishlist ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
        >
          <svg
            className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            fill={inWishlist ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {product.rating && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="text-xs text-gray-600">{product.rating}</span>
              </div>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-unklab-blue transition-colors">
            {product.name}
          </h3>

          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-bold text-unklab-blue">
              {formatPrice(product.price)}
            </span>
            <button
              onClick={handleAddToCart}
              className="bg-unklab-blue text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-opacity-90 transition-all duration-200 hover:shadow-md active:scale-95 whitespace-nowrap"
            >
              + Keranjang
            </button>
          </div>

          {/* Stock Badge */}
          {product.stock < 10 && product.stock > 0 && (
            <span className="badge bg-yellow-100 text-yellow-700">
              Tersisa {product.stock} item!
            </span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-red-100 text-red-700">Stok Habis</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
