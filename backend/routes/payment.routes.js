/**
 * Payment Routes
 * 
 * Routes untuk pembayaran dengan Midtrans
 */

import express from 'express';
import {
  createPayment,
  handleNotification,
  checkPaymentStatus,
  cancelPayment,
  getPaymentConfig,
} from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (Tanpa Authentication)
// ============================================

/**
 * POST /api/payment/notification
 * Webhook endpoint untuk Midtrans callback
 * HARUS public tanpa authentication!
 */
router.post('/notification', handleNotification);

/**
 * GET /api/payment/config
 * Get client key untuk frontend
 */
router.get('/config', getPaymentConfig);

// ============================================
// PROTECTED ROUTES (Butuh Authentication)
// ============================================

/**
 * POST /api/payment/create
 * Buat transaksi pembayaran
 */
router.post('/create', authenticate, createPayment);

/**
 * GET /api/payment/status/:orderId
 * Cek status pembayaran
 */
router.get('/status/:orderId', authenticate, checkPaymentStatus);

/**
 * POST /api/payment/cancel/:orderId
 * Batalkan pembayaran
 */
router.post('/cancel/:orderId', authenticate, cancelPayment);

export default router;

