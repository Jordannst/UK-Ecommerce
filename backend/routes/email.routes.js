/**
 * Email Routes
 * 
 * Routes untuk test dan manajemen email service
 */

import express from 'express';
import { testEmail, sendOrderEmail } from '../controllers/email.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/email/test
 * Test email configuration (public for testing)
 */
router.get('/test', testEmail);

/**
 * POST /api/email/send-order/:orderId
 * Send order confirmation email manually (requires auth)
 */
router.post('/send-order/:orderId', authenticate, sendOrderEmail);

export default router;

