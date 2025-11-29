/**
 * Email Controller
 * 
 * Controller untuk test dan manajemen email service
 */

import prisma from '../utils/prisma.js';
import { sendOrderConfirmationEmail, testEmailConnection } from '../services/email.service.js';
import { authenticate } from '../middleware/auth.js';

/**
 * GET /api/email/test
 * Test email configuration
 */
export const testEmail = async (req, res, next) => {
  try {
    const result = await testEmailConnection();
    
    res.json({
      success: result.success,
      message: result.message,
      provider: result.provider,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/email/send-order/:orderId
 * Send order confirmation email manually (for testing)
 * Requires authentication
 */
export const sendOrderEmail = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Find order
    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
        // User can only send email for their own orders, unless admin
        ...(isAdmin ? {} : { userId }),
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan',
      });
    }

    // Send email
    const result = await sendOrderConfirmationEmail(order, order.user);

    if (result.success) {
      res.json({
        success: true,
        message: 'Email berhasil dikirim',
        data: {
          orderNumber: order.orderNumber,
          to: order.user.email,
          provider: result.provider,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || 'Gagal mengirim email',
        error: result.error,
      });
    }
  } catch (error) {
    next(error);
  }
};

export default {
  testEmail,
  sendOrderEmail,
};

