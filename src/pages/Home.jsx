import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const productsData = await productService.getAllProducts();
      
      // Get latest 8 products
      const sortedProducts = productsData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8);
      
      setProducts(sortedProducts);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Hero />

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Produk Terbaru</h2>
            <p className="text-gray-600 mt-2">Lihat produk terbaru kami</p>
          </div>
          <Link to="/shop" className="btn-ghost">
            Lihat Semua →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-unklab-blue to-blue-900 rounded-3xl p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Penawaran Spesial untuk Mahasiswa UNKLAB
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Dapatkan diskon 15% untuk pembelian pertama. Gunakan kode: <span className="font-bold">UNKLAB2024</span>
          </p>
          <Link to="/shop" className="btn-primary bg-white text-unklab-blue hover:bg-gray-100 inline-block">
            Belanja Sekarang
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-unklab-light rounded-xl flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-unklab-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Produk Lokal</h3>
            <p className="text-gray-600">Dukung bisnis lokal dan entrepreneur mahasiswa</p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-unklab-light rounded-xl flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-unklab-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Harga Terbaik</h3>
            <p className="text-gray-600">Harga bersaing untuk mahasiswa</p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-unklab-light rounded-xl flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-unklab-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Pengiriman Cepat</h3>
            <p className="text-gray-600">Pengiriman cepat di area kampus</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


