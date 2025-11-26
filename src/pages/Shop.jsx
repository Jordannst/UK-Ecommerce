import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    loadProducts();
  }, [priceRange, searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      let data = await productService.getAllProducts();

      // Filter by price range
      if (priceRange === 'low') {
        data = data.filter((p) => p.price < 100000);
      } else if (priceRange === 'mid') {
        data = data.filter((p) => p.price >= 100000 && p.price < 200000);
      } else if (priceRange === 'high') {
        data = data.filter((p) => p.price >= 200000);
      }

      // Filter by search query
      if (searchQuery) {
        data = data.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Belanja</h1>
        <p className="text-gray-600">Temukan produk terbaik dari UNKLAB Store</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-12"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="card p-6 sticky top-24 space-y-6">
            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Rentang Harga</h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'Semua Harga' },
                  { value: 'low', label: 'Di bawah Rp 100K' },
                  { value: 'mid', label: 'Rp 100K - 200K' },
                  { value: 'high', label: 'Di atas Rp 200K' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="priceRange"
                      value={option.value}
                      checked={priceRange === option.value}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-4 h-4 text-unklab-blue focus:ring-unklab-blue"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              {loading ? 'Memuat...' : `${products.length} produk ditemukan`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Produk tidak ditemukan</h3>
              <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
