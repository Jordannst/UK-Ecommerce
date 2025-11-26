import { useState, useEffect } from 'react';
import CategoryCard from '../components/CategoryCard';
import categoryService from '../services/categoryService';
import productService from '../services/productService';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, productsData] = await Promise.all([
        categoryService.getAllCategories(),
        productService.getAllProducts(),
      ]);
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductCountByCategory = (categoryName) => {
    return products.filter((p) => p.category === categoryName).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Categories</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our wide range of products organized by categories
        </p>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              productCount={getProductCountByCategory(category.name)}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6 card">
          <div className="text-3xl font-bold text-unklab-blue mb-2">{categories.length}+</div>
          <div className="text-gray-600">Categories</div>
        </div>
        <div className="text-center p-6 card">
          <div className="text-3xl font-bold text-unklab-blue mb-2">{products.length}+</div>
          <div className="text-gray-600">Products</div>
        </div>
        <div className="text-center p-6 card">
          <div className="text-3xl font-bold text-unklab-blue mb-2">1000+</div>
          <div className="text-gray-600">Happy Customers</div>
        </div>
      </div>
    </div>
  );
};

export default Categories;


