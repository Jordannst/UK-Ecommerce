/**
 * Payment Controller
 * 
 * Controller untuk menangani request terkait pembayaran Midtrans
 */

import prisma from '../utils/prisma.js';
import { clientKey, isProduction } from '../config/midtrans.js';
import {
  createSnapTransaction,
  handlePaymentNotification,
  getTransactionStatus,
  cancelTransaction,
} from '../services/payment.service.js';

/**
 * POST /api/payment/create
 * 
 * Membuat transaksi pembayaran dan generate Snap Token
 * Dipanggil setelah order dibuat
 */
export const createPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;

    // Validasi input
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID wajib diisi',
      });
    }

    // Cari order
    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
        userId: userId,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan',
      });
    }

    // Cek apakah order masih pending
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Order tidak dapat dibayar (status: ${order.status})`,
      });
    }

    // Cek apakah sudah ada snap token
    if (order.snapToken) {
      return res.json({
        success: true,
        message: 'Snap token sudah tersedia',
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          amount: order.totalAmount,
          snapToken: order.snapToken,
          redirectUrl: order.snapUrl,
          clientKey: clientKey,
        },
      });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Create snap transaction
    console.log(`📝 Creating payment for order: ${order.orderNumber}`);
    const { snapToken, redirectUrl } = await createSnapTransaction(order, user);

    res.json({
      success: true,
      message: 'Transaksi pembayaran berhasil dibuat',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        snapToken: snapToken,
        redirectUrl: redirectUrl,
        clientKey: clientKey,
      },
    });
  } catch (error) {
    console.error('❌ Error in createPayment:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    
    // Return more detailed error message
    const errorMessage = error.message || 'Gagal membuat transaksi pembayaran';
    
    // Check if it's a Midtrans API error
    if (errorMessage.includes('Midtrans') || errorMessage.includes('API')) {
      return res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Midtrans API Error - Periksa konfigurasi MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY di .env',
      });
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
};

/**
 * POST /api/payment/notification
 * 
 * Webhook endpoint untuk menerima callback dari Midtrans
 * PENTING: Endpoint ini harus publicly accessible tanpa auth
 */
export const handleNotification = async (req, res, next) => {
  try {
    const notification = req.body;

    console.log('📥 Received Midtrans notification:');
    console.log('   Transaction Status:', notification.transaction_status);
    console.log('   Order ID:', notification.order_id);
    console.log('   Payment Type:', notification.payment_type);
    console.log('   Full notification:', JSON.stringify(notification, null, 2));

    // Handle notification
    const updatedOrder = await handlePaymentNotification(notification);

    console.log('✅ Notification processed successfully:');
    console.log('   Order:', updatedOrder.orderNumber);
    console.log('   Status:', updatedOrder.status);
    console.log('   Payment Status:', updatedOrder.paymentStatus);

    // Kirim response 200 OK ke Midtrans
    // Midtrans akan retry jika tidak menerima 200
    res.status(200).json({
      success: true,
      message: 'Notification processed',
      orderId: updatedOrder.orderNumber,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
    });
  } catch (error) {
    console.error('❌ Error in handleNotification:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    
    // Tetap kirim 200 untuk menghindari retry yang tidak perlu
    // tapi log error untuk investigasi
    res.status(200).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/payment/status/:orderId
 * 
 * Cek status pembayaran order
 */
export const checkPaymentStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    // Cari order
    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
        userId: userId,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan',
      });
    }

    // Jika ada transaction ID atau snap token, cek status ke Midtrans dan update order
    let midtransStatus = null;
    let updatedOrder = order;
    
    if (order.transactionId || order.snapToken) {
      try {
        console.log(`🔍 Checking Midtrans status for order: ${order.orderNumber}`);
        midtransStatus = await getTransactionStatus(order.orderNumber);
        
        if (midtransStatus) {
          console.log(`📥 Midtrans status response:`, {
            transaction_status: midtransStatus?.transaction_status,
            fraud_status: midtransStatus?.fraud_status,
            payment_type: midtransStatus?.payment_type,
          });
        } else {
          console.log(`ℹ️  Transaction not found in Midtrans (may not be created yet or expired)`);
        }
        
        // Update order jika status dari Midtrans berbeda
        if (midtransStatus && midtransStatus.transaction_status) {
          const { mapTransactionStatus } = await import('../utils/verifyMidtrans.js');
          const { orderStatus, paymentStatus } = mapTransactionStatus(
            midtransStatus.transaction_status,
            midtransStatus.fraud_status
          );
          
          console.log(`📊 Mapped status: orderStatus=${orderStatus}, paymentStatus=${paymentStatus}`);
          console.log(`📊 Current status: orderStatus=${order.status}, paymentStatus=${order.paymentStatus}`);
          
          // Update jika status berubah
          if (order.status !== orderStatus || order.paymentStatus !== paymentStatus) {
            const previousPaymentStatus = order.paymentStatus;
            
            updatedOrder = await prisma.order.update({
              where: { id: order.id },
              data: {
                status: orderStatus,
                paymentStatus: paymentStatus,
                transactionId: midtransStatus.transaction_id || order.transactionId,
                paymentType: midtransStatus.payment_type || order.paymentType,
                paidAt: paymentStatus === 'paid' && midtransStatus.transaction_time
                  ? new Date(midtransStatus.transaction_time)
                  : order.paidAt,
              },
            });
            
            console.log(`✅ Order ${order.orderNumber} status updated: ${order.status} → ${orderStatus}, ${order.paymentStatus} → ${paymentStatus}`);
            
            // Jika payment status berubah menjadi paid, kirim email
            if (paymentStatus === 'paid' && previousPaymentStatus !== 'paid') {
              console.log(`📧 Payment completed, sending confirmation email for order: ${order.orderNumber}`);
              try {
                // Get user data
                const user = await prisma.user.findUnique({
                  where: { id: order.userId },
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                });

                if (user) {
                  // Get order dengan items untuk email
                  const orderForEmail = await prisma.order.findUnique({
                    where: { id: order.id },
                    include: {
                      orderItems: {
                        include: {
                          product: true,
                        },
                      },
                    },
                  });

                  if (orderForEmail) {
                    // Kirim email (async, tidak blocking)
                    const { sendOrderConfirmationEmail } = await import('../services/email.service.js');
                    sendOrderConfirmationEmail(orderForEmail, user)
                      .then((result) => {
                        if (result.success) {
                          console.log('✅ Email konfirmasi berhasil dikirim:', {
                            order: order.orderNumber,
                            to: user.email,
                            provider: result.provider,
                          });
                        } else {
                          console.error('❌ Email konfirmasi gagal dikirim:', {
                            order: order.orderNumber,
                            to: user.email,
                            error: result.message || result.error,
                          });
                        }
                      })
                      .catch((emailError) => {
                        console.error('❌ Error sending confirmation email:', {
                          order: order.orderNumber,
                          to: user.email,
                          error: emailError.message,
                        });
                      });
                  }
                }
              } catch (emailError) {
                console.error('❌ Error preparing email:', emailError.message);
              }
            }
          } else {
            console.log(`ℹ️  Order ${order.orderNumber} status unchanged`);
          }
        } else {
          console.warn(`⚠️  Midtrans status tidak memiliki transaction_status`);
        }
      } catch (err) {
        console.error('❌ Could not fetch Midtrans status:', err.message);
        console.error('   Error details:', err);
      }
    } else {
      console.log(`ℹ️  Order ${order.orderNumber} tidak memiliki transactionId atau snapToken`);
    }

    res.json({
      success: true,
      data: {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        orderStatus: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        paymentType: updatedOrder.paymentType,
        paidAt: updatedOrder.paidAt,
        midtransStatus: midtransStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payment/cancel/:orderId
 * 
 * Batalkan pembayaran dan order
 */
export const cancelPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    // Cari order
    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
        userId: userId,
      },
      include: { orderItems: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan',
      });
    }

    // Hanya bisa cancel jika masih pending
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Order tidak dapat dibatalkan (status: ${order.status})`,
      });
    }

    // Cancel di Midtrans jika ada transaksi
    if (order.transactionId) {
      try {
        await cancelTransaction(order.orderNumber);
      } catch (err) {
        console.warn('⚠️ Could not cancel Midtrans transaction:', err.message);
      }
    }

    // Update order status dan kembalikan stok
    await prisma.$transaction(async (tx) => {
      // Update order
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'cancelled',
          paymentStatus: 'cancelled',
        },
      });

      // Kembalikan stok
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            sold: { decrement: item.quantity },
          },
        });
      }
    });

    res.json({
      success: true,
      message: 'Pembayaran berhasil dibatalkan',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payment/config
 * 
 * Get Midtrans client key untuk frontend
 */
export const getPaymentConfig = async (req, res) => {
  res.json({
    success: true,
    data: {
      clientKey: clientKey,
      isProduction: isProduction,
      snapUrl: isProduction
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js',
    },
  });
};

export default {
  createPayment,
  handleNotification,
  checkPaymentStatus,
  cancelPayment,
  getPaymentConfig,
};

