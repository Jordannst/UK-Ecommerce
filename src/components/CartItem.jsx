import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from './ConfirmDialog';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const toast = useToast();
  const [showConfirm, setShowConfirm] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleRemoveClick = () => {
    setShowConfirm(true);
  };

  const confirmRemove = () => {
    removeFromCart(item.id);
    toast.success(`${item.name} dihapus dari keranjang`);
  };

  return (
    <>
      <div className="card p-4 flex flex-col sm:flex-row gap-4">
        {/* Image */}
        <Link to={`/product/${item.productId}`} className="flex-shrink-0">
          <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex-1">
            <Link
              to={`/product/${item.productId}`}
              className="font-semibold text-gray-900 hover:text-starg-pink transition-colors"
            >
              {item.name}
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              {formatPrice(item.price)} × {item.quantity}
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4">
            {/* Quantity Controls */}
            <div className="flex items-center space-x-2 border border-gray-300 rounded-lg">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-l-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-12 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-r-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Price and Remove */}
            <div className="flex items-center gap-4">
              <span className="font-bold text-starg-pink">
                {formatPrice(item.price * item.quantity)}
              </span>
              <button
                onClick={handleRemoveClick}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Hapus dari keranjang"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmRemove}
        title="Hapus dari Keranjang"
        message={`Apakah Anda yakin ingin menghapus "${item.name}" dari keranjang?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />
    </>
  );
};

export default CartItem;
