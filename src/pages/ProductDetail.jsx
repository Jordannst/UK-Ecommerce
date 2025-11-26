import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, getWishlistItemByProductId } = useWishlist();
  const toast = useToast();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(id);
      setProduct(data);

      // Load related products
      const allProducts = await productService.getAllProducts();
      const currentCategoryId = data.category?.id || data.categoryId;
      const related = allProducts
        .filter((p) => {
          const pCategoryId = p.category?.id || p.categoryId;
          return pCategoryId === currentCategoryId && p.id !== data.id;
        })
        .slice(0, 4);
      setRelatedProducts(related);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const success = await addToCart(product, quantity);
    if (success) {
      toast.success(`${product.name} ditambahkan ke keranjang! 🛒`);
    } else {
      toast.error('Silakan login terlebih dahulu');
    }
  };

  const handleWishlistToggle = async () => {
    if (isInWishlist(product.id)) {
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-2xl"></div>
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Produk tidak ditemukan</h2>
        <Link to="/shop" className="btn-primary mt-4 inline-block">
          Kembali ke Toko
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link to="/" className="hover:text-starg-pink">Beranda</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-starg-pink">Belanja</Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* Product Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        {/* Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              {product.rating && (
                <div className="flex items-center space-x-1">
                  <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-gray-500">({product.reviews} ulasan)</span>
                </div>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="border-t border-b border-gray-200 py-6 space-y-4">
            <div className="flex items-baseline space-x-4">
              <span className="text-4xl font-bold text-starg-pink">
                {formatPrice(product.price)}
              </span>
            </div>

            {product.faculty && (
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-600">Fakultas/UKM:</span>
                <span className="font-medium">{product.faculty}</span>
              </div>
            )}

            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-600">Stok:</span>
              <span className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                {product.stock} tersedia
              </span>
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Jumlah:</span>
              <div className="flex items-center space-x-2 border border-gray-300 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-l-xl transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-r-xl transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`btn-secondary w-14 h-14 flex items-center justify-center ${
                  inWishlist ? 'bg-red-50 border-red-500' : ''
                }`}
                title={inWishlist ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
              >
                <svg
                  className={`w-6 h-6 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-starg-pink'}`}
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
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Produk Terkait</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
