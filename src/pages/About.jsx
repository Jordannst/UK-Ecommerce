import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          About Starg
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your one-stop platform for authentic Starg products and quality merchandise
        </p>
      </div>

      {/* Mission */}
      <section className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              Starg adalah platform e-commerce yang menghubungkan pelanggan 
              dengan produk-produk berkualitas dari berbagai merchant.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Kami berkomitmen untuk mendukung UKM dan produk lokal berkualitas, 
              sambil memberikan pengalaman berbelanja yang modern dan menyenangkan.
            </p>
          </div>
          <div className="card p-8 bg-gradient-to-br from-starg-pink to-pink-400 text-white">
            <div className="space-y-6">
              <div>
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-pink-100">Products Available</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">1000+</div>
                <div className="text-pink-100">Happy Customers</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-pink-100">Local Partners</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-starg-pink-light rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-starg-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality First</h3>
            <p className="text-gray-600">
              Setiap produk dipilih dengan cermat untuk memastikan kualitas terbaik bagi pelanggan kami.
            </p>
          </div>

          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-starg-pink-light rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-starg-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Support</h3>
            <p className="text-gray-600">
              Mendukung UKM dan entrepreneur lokal untuk tumbuh dan berkembang.
            </p>
          </div>

          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-starg-pink-light rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-starg-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast & Reliable</h3>
            <p className="text-gray-600">
              Pengiriman cepat dan layanan pelanggan yang responsif untuk kepuasan Anda.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-starg-pink to-pink-400 rounded-3xl p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
        <p className="text-lg text-pink-100 mb-8 max-w-2xl mx-auto">
          Explore our collection of quality products and support local businesses
        </p>
        <Link to="/shop" className="btn-primary bg-white text-starg-pink hover:bg-gray-100 inline-block">
          Shop Now
        </Link>
      </section>

      {/* Contact */}
      <section className="mt-20">
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Visit Us</h3>
              <p className="text-gray-600">
                Starg E-Commerce<br />
                Indonesia<br />
                Online Store
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Get in Touch</h3>
              <p className="text-gray-600">
                Email: store@starg.com<br />
                Phone: +62 812-3456-7890<br />
                Hours: Mon-Fri, 8AM-5PM
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;


