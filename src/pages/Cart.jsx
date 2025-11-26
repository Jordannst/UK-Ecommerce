import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = () => {
  const { cartItems, cartTotal, loading } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const shippingCost = 15000;
  const total = cartTotal + shippingCost;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <svg
            className="w-24 h-24 text-gray-400 mx-auto mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <Link to="/shop" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

            <div className="space-y-3 text-sm">
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

            <Link to="/checkout" className="btn-primary w-full block text-center">
              Proceed to Checkout
            </Link>

            <Link
              to="/shop"
              className="text-center text-sm text-unklab-blue hover:underline block"
            >
              Continue Shopping
            </Link>

            {/* Promo Code */}
            <div className="border-t border-gray-200 pt-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="input-field text-sm py-2"
                />
                <button className="btn-secondary text-sm py-2 whitespace-nowrap">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;


