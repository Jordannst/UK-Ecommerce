import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import orderService from '../services/orderService';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Airmadidi',
    notes: '',
    paymentMethod: 'Transfer Bank',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        userId: 2, // Default user
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        total: cartTotal + shippingCost,
        status: 'Pending',
        paymentMethod: formData.paymentMethod,
        shippingAddress: `${formData.address}, ${formData.city}`,
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        notes: formData.notes,
      };

      const order = await orderService.createOrder(orderData);
      await clearCart();
      
      navigate(`/order-success/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
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
            {/* Customer Information */}
            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="john@student.unklab.ac.id"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
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
            </div>

            {/* Shipping Address */}
            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="input-field"
                  placeholder="Street address, building, apt number..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
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
                  Order Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="2"
                  className="input-field"
                  placeholder="Any special instructions..."
                ></textarea>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>

              <div className="space-y-3">
                {['Transfer Bank', 'Cash on Delivery', 'E-Wallet'].map((method) => (
                  <label key={method} className="flex items-center space-x-3 cursor-pointer card p-4 hover:border-unklab-blue">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={formData.paymentMethod === method}
                      onChange={handleChange}
                      className="w-4 h-4 text-unklab-blue focus:ring-unklab-blue"
                    />
                    <span className="text-gray-700 font-medium">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

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
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{formatPrice(shippingCost)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-unklab-blue">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cartItems.length === 0}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;


