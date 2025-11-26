import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [snapReady, setSnapReady] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Airmadidi',
    notes: '',
    paymentMethod: 'Midtrans',
  });

  // Load Midtrans Snap script on mount
  useEffect(() => {
    const loadSnap = async () => {
      try {
        const config = await paymentService.getConfig();
        await paymentService.loadSnapScript(config.clientKey, config.isProduction);
        setSnapReady(true);
        console.log('✅ Midtrans Snap loaded');
      } catch (error) {
        console.error('❌ Failed to load Midtrans Snap:', error);
        toast.error('Gagal memuat sistem pembayaran. Refresh halaman.');
      }
    };
    loadSnap();
  }, []);

  // Auto-fill form dengan data user
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast.warning('Keranjang Anda kosong!');
      return;
    }

    if (!snapReady) {
      toast.error('Sistem pembayaran belum siap. Mohon tunggu...');
      return;
    }

    try {
      setLoading(true);
      toast.info('Memproses pesanan...');

      const orderData = {
        shippingName: formData.name,
        shippingPhone: formData.phone,
        shippingAddress: formData.address,
        shippingCity: formData.city,
        shippingZip: '',
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      // 1. Create order
      const order = await orderService.createOrder(orderData);
      
      // 2. Create payment transaction
      toast.info('Menyiapkan pembayaran...');
      const payment = await paymentService.createPayment(order.id);
      
      // 3. Open Midtrans Snap popup
      setLoading(false);
      
      paymentService.openSnapPopup(payment.snapToken, {
        onSuccess: async (result) => {
          console.log('✅ Payment success:', result);
          await clearCart();
          
          // Polling status beberapa kali (karena Midtrans mungkin butuh waktu untuk update)
          let statusUpdated = false;
          for (let i = 0; i < 5; i++) {
            try {
              console.log(`Checking payment status (attempt ${i + 1}/5)...`);
              const status = await paymentService.checkStatus(order.id);
              
              if (status.paymentStatus === 'paid' || status.orderStatus === 'processing') {
                console.log('✅ Status updated to paid!');
                statusUpdated = true;
                break;
              }
              
              // Wait 1 second before next check
              if (i < 4) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            } catch (err) {
              console.warn('Could not check payment status:', err);
            }
          }
          
          if (!statusUpdated) {
            console.warn('⚠️ Status belum terupdate. Silakan cek status manual.');
            toast.warning('Status sedang diperbarui. Jika belum berubah, silakan klik "Cek Status" di Dashboard.');
          }
          
          toast.success('Pembayaran berhasil! 🎉');
          // Navigate to order success page
          navigate(`/order-success/${order.id}`);
        },
        onPending: async (result) => {
          console.log('⏳ Payment pending:', result);
          await clearCart();
          
          // Check status dari backend
          try {
            await paymentService.checkStatus(order.id);
          } catch (err) {
            console.warn('Could not check payment status:', err);
          }
          
          toast.info('Pembayaran tertunda. Silakan selesaikan pembayaran.');
          setTimeout(() => {
            navigate(`/order-success/${order.id}`);
          }, 1000);
        },
        onError: (result) => {
          console.error('❌ Payment error:', result);
          toast.error('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: async () => {
          console.log('🚪 Payment popup closed');
          
          // Check status setelah popup ditutup (bisa jadi user sudah bayar di popup lain)
          try {
            const status = await paymentService.checkStatus(order.id);
            if (status.paymentStatus === 'paid') {
              await clearCart();
              toast.success('Pembayaran berhasil! 🎉');
              navigate(`/order-success/${order.id}`);
              return;
            }
          } catch (err) {
            console.warn('Could not check payment status:', err);
          }
          
          toast.warning('Pembayaran dibatalkan. Pesanan tersimpan, Anda dapat membayar nanti.');
          navigate(`/dashboard`);
        },
      });
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Gagal membuat pesanan. Silakan coba lagi.');
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

  const shippingCost = 15000;
  const total = cartTotal + shippingCost;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information - Auto-filled */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Informasi Pemesan</h2>
                <span className="badge bg-green-100 text-green-700">Data dari akun</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-starg-pink to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{user?.name?.charAt(0) || 'U'}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{user?.name || 'Pengguna'}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  {user?.phone && (
                    <p className="text-sm text-gray-500">{user.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Alamat Pengiriman</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Penerima *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Nama penerima paket"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="081234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="input-field"
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kota *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="Airmadidi">Airmadidi</option>
                  <option value="Tomohon">Tomohon</option>
                  <option value="Manado">Manado</option>
                  <option value="Bitung">Bitung</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Pesanan (Opsional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="2"
                  className="input-field"
                  placeholder="Catatan khusus untuk kurir (warna rumah, patokan, dll)"
                ></textarea>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Metode Pembayaran</h2>

              {/* Midtrans Payment Gateway Info */}
              <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <span className="text-2xl">💳</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Midtrans Payment Gateway</h3>
                    <p className="text-sm text-gray-600">Pembayaran aman & terpercaya</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {['BCA', 'BNI', 'BRI', 'Mandiri'].map((bank) => (
                    <div key={bank} className="bg-white rounded-lg p-2 text-center shadow-sm">
                      <span className="text-xs font-medium text-gray-700">{bank}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    { name: 'GoPay', icon: '🟢' },
                    { name: 'OVO', icon: '🟣' },
                    { name: 'DANA', icon: '🔵' },
                    { name: 'ShopeePay', icon: '🟠' },
                    { name: 'Credit Card', icon: '💳' },
                  ].map((method) => (
                    <span key={method.name} className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded text-xs text-gray-600 shadow-sm">
                      <span>{method.icon}</span>
                      {method.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Loading indicator for Snap */}
              {!snapReady && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm">Memuat sistem pembayaran...</span>
                </div>
              )}

              {snapReady && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Sistem pembayaran siap</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Ringkasan Pesanan</h2>

              {/* Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartItems.length} item)</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ongkos Kirim</span>
                  <span className="font-medium">{formatPrice(shippingCost)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-base">
                  <span className="font-semibold">Total Pembayaran</span>
                  <span className="font-bold text-starg-pink">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cartItems.length === 0 || !snapReady}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    <span>💳</span>
                    Bayar Sekarang
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Pembayaran diproses secara aman melalui Midtrans
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
