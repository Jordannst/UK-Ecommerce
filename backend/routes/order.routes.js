import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrderByNumber,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
} from '../controllers/order.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// User routes (require authentication)
router.use(authenticate);

router.post('/', createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrderById);
router.get('/number/:orderNumber', getOrderByNumber);
router.put('/:id/cancel', cancelOrder);

// Admin routes
router.get('/admin/all', requireAdmin, getAllOrders);
router.put('/admin/:id/status', requireAdmin, updateOrderStatus);

export default router;

