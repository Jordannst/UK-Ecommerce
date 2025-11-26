import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-unklab-blue to-blue-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                Toko Kampus Eksklusif
              </span>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Belanja Cerdas,
                <br />
                <span className="text-yellow-300">UNKLAB</span>
              </h1>
              <p className="text-lg md:text-xl text-blue-100 max-w-lg">
                Temukan produk eksklusif UNKLAB dan produk lokal Sulawesi Utara. 
                Dibuat dengan cinta oleh mahasiswa, untuk mahasiswa.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop" className="btn-primary bg-white text-unklab-blue hover:bg-gray-100">
                Jelajahi Produk
              </Link>
              <Link to="/categories" className="bg-transparent text-white border-2 border-white px-6 py-3 rounded-xl font-medium hover:bg-white hover:text-unklab-blue transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                Lihat Kategori
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white border-opacity-20">
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-blue-200">Produk</div>
              </div>
              <div>
                <div className="text-3xl font-bold">1000+</div>
                <div className="text-sm text-blue-200">Mahasiswa</div>
              </div>
              <div>
                <div className="text-3xl font-bold">4.8★</div>
                <div className="text-sm text-blue-200">Rating</div>
              </div>
            </div>
          </div>

          {/* Right Content - Floating Cards */}
          <div className="hidden md:block relative h-96">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 transform rotate-6 hover:rotate-0 transition-transform duration-300">
              <div className="w-full h-32 bg-white bg-opacity-20 rounded-xl mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-white bg-opacity-20 rounded"></div>
                <div className="h-4 bg-white bg-opacity-20 rounded w-2/3"></div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
              <div className="w-full h-32 bg-white bg-opacity-20 rounded-xl mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-white bg-opacity-20 rounded"></div>
                <div className="h-4 bg-white bg-opacity-20 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


