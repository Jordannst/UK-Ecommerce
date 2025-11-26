import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import orderService from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/ConfirmDialog';

const AdminOrders = () => {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusConfirm, setStatusConfirm] = useState({ show: false, orderId: null, newStatus: null });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setStatusConfirm({ show: true, orderId, newStatus });
  };

  const confirmStatusUpdate = async () => {
    if (statusConfirm.orderId && statusConfirm.newStatus) {
      try {
        await orderService.updateOrderStatus(statusConfirm.orderId, statusConfirm.newStatus);
        toast.success(`Status pesanan berhasil diubah ke ${getStatusLabel(statusConfirm.newStatus)} ✅`);
        loadOrders();
        if (selectedOrder && selectedOrder.id === statusConfirm.orderId) {
          setSelectedOrder({ ...selectedOrder, status: statusConfirm.newStatus });
        }
      } catch (error) {
        console.error('Error updating order status:', error);
        toast.error('Gagal mengupdate status pesanan');
      }
    }
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

  const getPaymentStatusLabel = (status) => {
    const labels = {
      pending: 'Belum Bayar',
      paid: 'Sudah Bayar',
      expired: 'Kadaluarsa',
      cancelled: 'Dibatalkan',
      refund: 'Refund',
    };
    return labels[status] || status || '-';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700',
      paid: 'bg-green-100 text-green-700',
      expired: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
      refund: 'bg-orange-100 text-orange-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Kelola Pesanan</h1>

          {loading ? (
            <div className="card p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="card p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-600">Belum ada pesanan</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Pesanan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {orders.map((order) => {
                      // Highlight order yang sudah paid tapi masih pending (menunggu admin approve)
                      const needsAttention = order.paymentStatus === 'paid' && order.status === 'pending';
                      
                      return (
                        <tr 
                          key={order.id} 
                          className={`hover:bg-gray-50 ${needsAttention ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {order.orderNumber}
                            {needsAttention && (
                              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                💰 Dibayar
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {order.shippingName || order.user?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {order.orderItems?.length || 0} item
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`badge ${getPaymentStatusColor(order.paymentStatus)}`}>
                              {getPaymentStatusLabel(order.paymentStatus)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                              className={`badge ${getStatusColor(order.status)} cursor-pointer`}
                            >
                              <option value="pending">Menunggu</option>
                              <option value="processing">Diproses</option>
                              <option value="completed">Selesai</option>
                              <option value="cancelled">Dibatalkan</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewOrder(order)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{selectedOrder.orderNumber}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Informasi Pelanggan</h3>
                <div className="card p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nama:</span>
                    <span className="font-medium">{selectedOrder.shippingName || selectedOrder.user?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedOrder.user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Telepon:</span>
                    <span className="font-medium">{selectedOrder.shippingPhone || selectedOrder.user?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Item Pesanan</h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems?.map((item, index) => (
                    <div key={index} className="card p-4 flex gap-3">
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
                      <p className="font-medium text-gray-900">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Ringkasan Pesanan</h3>
                <div className="card p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Metode Pembayaran:</span>
                    <span className="font-medium">{selectedOrder.paymentMethod || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alamat Pengiriman:</span>
                    <span className="font-medium text-right">
                      {selectedOrder.shippingAddress}
                      {selectedOrder.shippingCity && `, ${selectedOrder.shippingCity}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status Pembayaran:</span>
                    <span className={`badge ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                      {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status Pesanan:</span>
                    <span className={`badge ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                  {selectedOrder.paymentStatus === 'paid' && selectedOrder.status === 'pending' && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ⚠️ Pesanan sudah dibayar, menunggu admin untuk mengubah status menjadi "Diproses"
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200 text-base">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-starg-pink">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Confirmation Dialog */}
      <ConfirmDialog
        isOpen={statusConfirm.show}
        onClose={() => setStatusConfirm({ show: false, orderId: null, newStatus: null })}
        onConfirm={confirmStatusUpdate}
        title="Ubah Status Pesanan"
        message={`Apakah Anda yakin ingin mengubah status pesanan ke "${getStatusLabel(statusConfirm.newStatus)}"?`}
        confirmText="Ya, Ubah"
        cancelText="Batal"
        type="info"
      />
    </div>
  );
};

export default AdminOrders;


