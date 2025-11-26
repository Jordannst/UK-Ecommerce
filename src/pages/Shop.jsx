import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';
import categoryService from '../services/categoryService';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const selectedCategory = searchParams.get('category') || 'All';
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, priceRange, searchQuery]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      let data = await productService.getAllProducts();

      // Filter by category
      if (selectedCategory !== 'All') {
        data = data.filter((p) => {
          const categoryName = p.category?.name || p.category;
          return categoryName === selectedCategory;
        });
      }

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

  const handleCategoryChange = (category) => {
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Shop</h1>
        <p className="text-gray-600">Discover amazing products from UNKLAB</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <input
            type="text"
            placeholder="Search products..."
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
            {/* Categories */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('All')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'All'
                      ? 'bg-unklab-blue text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  All Products
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.name)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-unklab-blue text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Prices' },
                  { value: 'low', label: 'Under Rp 100K' },
                  { value: 'mid', label: 'Rp 100K - 200K' },
                  { value: 'high', label: 'Above Rp 200K' },
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
              {loading ? 'Loading...' : `${products.length} products found`}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
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


