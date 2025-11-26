import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import orderService from '../services/orderService';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Airmadidi',
    notes: '',
    paymentMethod: 'Transfer Bank',
  });

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

      const order = await orderService.createOrder(orderData);
      await clearCart();
      
      toast.success('Pesanan berhasil dibuat! 🎉');
      navigate(`/order-success/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Gagal membuat pesanan. Silakan coba lagi.');
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
                <div className="w-12 h-12 bg-gradient-to-br from-unklab-blue to-blue-600 rounded-full flex items-center justify-center">
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

              <div className="space-y-3">
                {[
                  { value: 'Transfer Bank', label: 'Transfer Bank', icon: '🏦' },
                  { value: 'Bayar di Tempat (COD)', label: 'Bayar di Tempat (COD)', icon: '💵' },
                  { value: 'E-Wallet', label: 'E-Wallet (OVO, GoPay, Dana)', icon: '📱' },
                ].map((method) => (
                  <label 
                    key={method.value} 
                    className={`flex items-center space-x-3 cursor-pointer card p-4 transition-all ${
                      formData.paymentMethod === method.value 
                        ? 'border-unklab-blue bg-blue-50' 
                        : 'hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={formData.paymentMethod === method.value}
                      onChange={handleChange}
                      className="w-4 h-4 text-unklab-blue focus:ring-unklab-blue"
                    />
                    <span className="text-xl">{method.icon}</span>
                    <span className="text-gray-700 font-medium">{method.label}</span>
                  </label>
                ))}
              </div>
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
                  <span className="font-bold text-unklab-blue">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cartItems.length === 0}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Buat Pesanan'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Dengan menekan tombol di atas, Anda menyetujui syarat dan ketentuan yang berlaku
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
