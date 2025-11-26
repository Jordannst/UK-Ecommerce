import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await orderService.getUserOrders();
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Menunggu',
      processing: 'Diproses',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    return labels[status] || status;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Saya</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="card p-6 space-y-6">
            {/* Profile */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-unklab-blue to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <h2 className="font-semibold text-gray-900">{user?.name || 'Pengguna'}</h2>
              <p className="text-sm text-gray-500">{user?.email || ''}</p>
            </div>

            {/* Menu */}
            <nav className="space-y-2 border-t border-gray-200 pt-6">
              <Link
                to="/dashboard"
                className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-unklab-light text-unklab-blue font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Pesanan Saya</span>
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Wishlist</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Pesanan</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Menunggu</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter((o) => o.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Selesai</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter((o) => o.status === 'completed').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Pesanan Terbaru</h2>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-gray-600 mb-4">Belum ada pesanan</p>
                <Link to="/shop" className="btn-primary inline-block">
                  Mulai Belanja
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <span className={`badge ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      {order.orderItems?.slice(0, 3).map((item, idx) => (
                        <img
                          key={idx}
                          src={item.product?.image || '/placeholder.png'}
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ))}
                      {order.orderItems?.length > 3 && (
                        <span className="text-sm text-gray-500">
                          +{order.orderItems.length - 3} lainnya
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-unklab-blue">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <Link
                        to={`/order-success/${order.id}`}
                        className="text-sm text-unklab-blue hover:underline"
                      >
                        Lihat Detail →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
