import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    loadOrder();
    // Auto-check status saat page load (polling beberapa kali)
    checkPaymentStatusWithPolling();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const data = await orderService.getOrderById(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatusWithPolling = async () => {
    // Polling status beberapa kali untuk memastikan status terupdate
    for (let i = 0; i < 3; i++) {
      try {
        setCheckingStatus(true);
        console.log(`🔍 Checking payment status (attempt ${i + 1}/3) for orderId: ${orderId}`);
        
        const status = await paymentService.checkStatus(orderId);
        
        console.log(`📥 Payment status response:`, {
          orderId: status.orderId,
          orderNumber: status.orderNumber,
          orderStatus: status.orderStatus,
          paymentStatus: status.paymentStatus,
          paymentType: status.paymentType,
          midtransStatus: status.midtransStatus?.transaction_status,
        });
        
        // Update order state dengan data terbaru dari status check
        if (status) {
          setOrder(prevOrder => ({
            ...prevOrder,
            status: status.orderStatus || prevOrder?.status,
            paymentStatus: status.paymentStatus || prevOrder?.paymentStatus,
            paymentType: status.paymentType || prevOrder?.paymentType,
            paidAt: status.paidAt || prevOrder?.paidAt,
          }));
        }
        
        // Reload order untuk mendapatkan data terbaru
        await loadOrder();
        
        // Jika sudah paid, stop polling
        if (status && (status.paymentStatus === 'paid' || status.orderStatus === 'processing')) {
          console.log('✅ Status updated to paid!', {
            paymentStatus: status.paymentStatus,
            orderStatus: status.orderStatus,
          });
          break;
        } else {
          console.log(`⏳ Status masih ${status?.paymentStatus || 'unknown'}, akan check lagi...`);
        }
        
        // Wait 2 seconds before next check
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (err) {
        console.error('❌ Error checking payment status:', err);
        console.error('   Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
      } finally {
        setCheckingStatus(false);
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

  const getStatusLabel = (status, paymentStatus) => {
    // Jika sudah paid tapi masih pending, artinya menunggu admin approve
    if (status === 'pending' && paymentStatus === 'paid') {
      return 'Menunggu Konfirmasi Admin';
    }
    
    const labels = {
      pending: 'Menunggu Pembayaran',
      processing: 'Diproses',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusLabel = (status) => {
    const labels = {
      pending: 'Belum Bayar',
      paid: 'Sudah Bayar',
      expired: 'Kadaluarsa',
      cancelled: 'Dibatalkan',
    };
    return labels[status] || status;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700',
      paid: 'bg-green-100 text-green-700',
      expired: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pesanan Berhasil Dibuat! 🎉</h1>
        <p className="text-gray-600">Terima kasih telah berbelanja di UNKLAB Store</p>
      </div>

      {order && (
        <div className="card p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detail Pesanan</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nomor Pesanan:</span>
                <span className="font-medium text-unklab-blue">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <div className="flex items-center gap-2">
                  <span className={`badge ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status, order.paymentStatus)}
                  </span>
                  {order.paymentStatus && (
                    <span className={`badge ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  )}
                  {order.status === 'pending' && order.paymentStatus === 'paid' && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      ⏳ Menunggu konfirmasi admin
                    </span>
                  )}
                  {order.status === 'pending' && (
                    <button
                      onClick={checkPaymentStatusWithPolling}
                      disabled={checkingStatus}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                    >
                      {checkingStatus ? 'Memeriksa...' : '🔄 Cek Status'}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Metode Pembayaran:</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Pembayaran:</span>
                <span className="font-bold text-unklab-blue">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Produk yang Dipesan</h3>
            <div className="space-y-3">
              {order.orderItems?.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <img
                    src={item.product?.image || '/placeholder.png'}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Langkah Selanjutnya</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                Pesanan Anda telah kami terima
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                Anda akan menerima konfirmasi via email
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                Pantau status pesanan di dashboard Anda
              </li>
            </ul>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/dashboard" className="btn-primary text-center">
          Lihat Pesanan Saya
        </Link>
        <Link to="/shop" className="btn-secondary text-center">
          Lanjut Belanja
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
