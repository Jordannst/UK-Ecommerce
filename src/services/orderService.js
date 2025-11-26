import api from '../config/api';

const orderService = {
  // Get user's orders
  getUserOrders: async (params = {}) => {
    const response = await api.get('/orders/my-orders', { params });
    return response.data.data;
  },

  // Get single order
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  // Get order by order number
  getOrderByNumber: async (orderNumber) => {
    const response = await api.get(`/orders/number/${orderNumber}`);
    return response.data.data;
  },

  // Create order from cart
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data.data;
  },

  // Cancel order
  cancelOrder: async (id) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },

  // Admin: Get all orders
  getAllOrders: async (params = {}) => {
    const response = await api.get('/orders/admin/all', { params });
    return response.data.data;
  },

  // Admin: Update order status
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/admin/${id}/status`, { status });
    return response.data.data;
  },
};

export default orderService;


