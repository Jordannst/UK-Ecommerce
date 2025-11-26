/**
 * Payment Service
 * 
 * Service layer untuk menangani logika pembayaran dengan Midtrans
 * Memisahkan business logic dari controller
 */

import { snap, coreApi } from '../config/midtrans.js';
import prisma from '../utils/prisma.js';
import { verifySignature, mapTransactionStatus } from '../utils/verifyMidtrans.js';

/**
 * Generate Midtrans Snap Token untuk order
 * 
 * @param {Object} order - Order object dari database
 * @param {Object} user - User object
 * @returns {Object} - { snapToken, redirectUrl }
 */
export const createSnapTransaction = async (order, user) => {
  // Validasi Midtrans configuration
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim();
  const clientKey = process.env.MIDTRANS_CLIENT_KEY?.trim();
  
  if (!serverKey || !clientKey) {
    throw new Error('Midtrans API keys tidak dikonfigurasi. Pastikan MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY ada di .env');
  }
  
  if (serverKey.includes('your_') || clientKey.includes('your_')) {
    throw new Error('Midtrans API keys masih menggunakan placeholder. Ganti dengan keys yang valid dari dashboard Midtrans.');
  }

  // Ambil order items
  const orderWithItems = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    }
  });

  if (!orderWithItems) {
    throw new Error('Order tidak ditemukan');
  }
  
  if (!orderWithItems.orderItems || orderWithItems.orderItems.length === 0) {
    throw new Error('Order tidak memiliki items');
  }

  // Format items untuk Midtrans
  const items = orderWithItems.orderItems.map(item => ({
    id: item.productId.toString(),
    price: Math.round(item.price), // Midtrans butuh integer
    quantity: item.quantity,
    name: item.productName.substring(0, 50), // Max 50 karakter
  }));

  // Validasi dan format order number
  // Midtrans memerlukan order_id unik dan alphanumeric (max 50 chars)
  let orderId = orderWithItems.orderNumber || `ORDER-${orderWithItems.id}-${Date.now()}`;
  
  // Pastikan order number tidak terlalu panjang dan hanya alphanumeric + dash
  orderId = orderId.replace(/[^a-zA-Z0-9-]/g, '').substring(0, 50);
  
  // Validasi total amount
  const grossAmount = Math.round(orderWithItems.totalAmount);
  if (grossAmount <= 0) {
    throw new Error('Total amount harus lebih dari 0');
  }
  
  if (grossAmount < 10000) {
    throw new Error('Minimum pembayaran adalah Rp 10.000');
  }

  // Validasi items
  if (!items || items.length === 0) {
    throw new Error('Order harus memiliki minimal 1 item');
  }

  // Hitung total dari items sebelum shipping
  const itemsTotalBeforeShipping = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Tambahkan shipping cost jika ada selisih
  const shippingCost = grossAmount - itemsTotalBeforeShipping;
  if (shippingCost > 0) {
    items.push({
      id: 'SHIPPING',
      price: shippingCost,
      quantity: 1,
      name: 'Biaya Pengiriman',
    });
  }

  // Pastikan total items match dengan gross amount (dalam toleransi 100 rupiah)
  const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const amountDiff = Math.abs(grossAmount - itemsTotal);
  if (amountDiff > 100) {
    console.warn(`⚠️  Amount mismatch: gross_amount=${grossAmount}, items_total=${itemsTotal}, diff=${amountDiff}`);
    // Adjust last item to match total
    if (items.length > 0) {
      const lastItem = items[items.length - 1];
      const adjustment = grossAmount - itemsTotal + (lastItem.price * lastItem.quantity);
      lastItem.price = Math.round(adjustment / lastItem.quantity);
    }
  }

  // Parameter untuk Midtrans Snap
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    item_details: items,
    customer_details: {
      first_name: (user.name.split(' ')[0] || 'Customer').substring(0, 50),
      last_name: (user.name.split(' ').slice(1).join(' ') || ' ').substring(0, 50),
      email: user.email,
      phone: (user.phone || orderWithItems.shippingPhone || '081234567890').replace(/[^0-9+]/g, '').substring(0, 19),
      billing_address: {
        first_name: orderWithItems.shippingName.split(' ')[0],
        last_name: orderWithItems.shippingName.split(' ').slice(1).join(' ') || '',
        phone: orderWithItems.shippingPhone,
        address: orderWithItems.shippingAddress,
        city: orderWithItems.shippingCity || 'Unknown',
        postal_code: orderWithItems.shippingZip || '00000',
        country_code: 'IDN',
      },
      shipping_address: {
        first_name: orderWithItems.shippingName.split(' ')[0],
        last_name: orderWithItems.shippingName.split(' ').slice(1).join(' ') || '',
        phone: orderWithItems.shippingPhone,
        address: orderWithItems.shippingAddress,
        city: orderWithItems.shippingCity || 'Unknown',
        postal_code: orderWithItems.shippingZip || '00000',
        country_code: 'IDN',
      },
    },
    // Callback URLs (opsional, untuk redirect setelah payment)
    callbacks: {
      finish: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-success/${order.id}`,
      error: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-failed/${order.id}`,
      pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-pending/${order.id}`,
    },
    // Expiry time (opsional)
    expiry: {
      start_time: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' +0700',
      unit: 'hours',
      duration: 24, // 24 jam
    },
  };

  try {
    console.log('📤 Creating Midtrans Snap transaction...');
    console.log('   Order ID:', parameter.transaction_details.order_id);
    console.log('   Amount:', parameter.transaction_details.gross_amount);
    console.log('   Items count:', parameter.item_details.length);
    console.log('   Customer:', user.email);
    console.log('   Midtrans Mode:', process.env.MIDTRANS_IS_PRODUCTION === 'true' ? 'Production' : 'Sandbox');
    
    // Validate parameter sebelum kirim ke Midtrans
    if (!parameter.transaction_details.order_id || !parameter.transaction_details.gross_amount) {
      throw new Error('Parameter transaction tidak valid: order_id atau gross_amount kosong');
    }
    
    if (!parameter.item_details || parameter.item_details.length === 0) {
      throw new Error('Parameter transaction tidak valid: tidak ada item details');
    }
    
    // Generate Snap Token
    console.log('   Sending request to Midtrans...');
    const transaction = await snap.createTransaction(parameter);

    console.log('✅ Snap token created successfully');

    // Update order dengan snap token dan URL
    await prisma.order.update({
      where: { id: order.id },
      data: {
        snapToken: transaction.token,
        snapUrl: transaction.redirect_url,
      },
    });

    return {
      snapToken: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  } catch (error) {
    console.error('❌ Error creating Snap transaction:');
    console.error('   Error message:', error.message);
    console.error('   Error name:', error.name);
    console.error('   Error stack:', error.stack);
    
    // Check different error types
    let errorMessage = error.message || 'Unknown error';
    
    // Handle network/connection errors
    if (error.message && error.message.includes('connection failure')) {
      errorMessage = 'Gagal terhubung ke Midtrans API. Periksa koneksi internet dan konfigurasi API key.';
    }
    
    // Handle API response errors
    if (error.ApiResponse) {
      try {
        const apiResponse = typeof error.ApiResponse === 'string' 
          ? JSON.parse(error.ApiResponse) 
          : error.ApiResponse;
        
        if (apiResponse.status_message) {
          errorMessage = apiResponse.status_message;
        } else if (apiResponse.message) {
          errorMessage = apiResponse.message;
        } else if (typeof apiResponse === 'string') {
          errorMessage = apiResponse;
        }
        
        console.error('   API Response:', JSON.stringify(apiResponse, null, 2));
      } catch (e) {
        console.error('   API Response (raw):', error.ApiResponse);
      }
    }
    
    // Handle HTTP status errors
    if (error.httpStatusCode) {
      console.error('   HTTP Status Code:', error.httpStatusCode);
      
      if (error.httpStatusCode === 401) {
        errorMessage = 'Unauthorized: Server key atau client key tidak valid. Periksa MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY di .env';
      } else if (error.httpStatusCode === 400) {
        errorMessage = 'Bad Request: Format data tidak valid. ' + (errorMessage || '');
      }
    }
    
    // Log full error for debugging
    console.error('   Full error object:', {
      name: error.name,
      message: error.message,
      httpStatusCode: error.httpStatusCode,
      ApiResponse: error.ApiResponse,
    });
    
    throw new Error(`Gagal membuat transaksi pembayaran: ${errorMessage}`);
  }
};

/**
 * Handle notification callback dari Midtrans
 * 
 * @param {Object} notification - Notification body dari Midtrans
 * @returns {Object} - Updated order
 */
export const handlePaymentNotification = async (notification) => {
  // 1. Verifikasi signature
  const isValidSignature = verifySignature(notification);
  if (!isValidSignature) {
    throw new Error('Invalid signature');
  }

  const {
    order_id,
    transaction_status,
    fraud_status,
    transaction_id,
    payment_type,
    transaction_time,
  } = notification;

  // 2. Cari order berdasarkan order_id (orderNumber)
  const order = await prisma.order.findUnique({
    where: { orderNumber: order_id },
    include: { orderItems: true },
  });

  if (!order) {
    throw new Error(`Order tidak ditemukan: ${order_id}`);
  }

  // 3. Map status dari Midtrans ke status aplikasi
  const { orderStatus, paymentStatus } = mapTransactionStatus(transaction_status, fraud_status);

  // 4. Update order
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: orderStatus,
      paymentStatus: paymentStatus,
      transactionId: transaction_id,
      paymentType: payment_type,
      paidAt: paymentStatus === 'paid' ? new Date(transaction_time) : null,
    },
  });

  // 5. Jika cancelled/expired, kembalikan stok
  if (orderStatus === 'cancelled' && order.status !== 'cancelled') {
    await restoreStock(order.orderItems);
  }

  console.log(`✅ Order ${order_id} updated: status=${orderStatus}, payment=${paymentStatus}`);

  return updatedOrder;
};

/**
 * Get transaction status dari Midtrans
 * 
 * @param {string} orderId - Order ID (orderNumber)
 * @returns {Object} - Transaction status
 */
export const getTransactionStatus = async (orderId) => {
  try {
    console.log(`🔍 Fetching transaction status from Midtrans for order: ${orderId}`);
    const status = await coreApi.transaction.status(orderId);
    console.log(`✅ Got status from Midtrans:`, {
      transaction_status: status?.transaction_status,
      fraud_status: status?.fraud_status,
      payment_type: status?.payment_type,
    });
    return status;
  } catch (error) {
    console.error('❌ Error getting transaction status:', error);
    console.error('   Order ID:', orderId);
    console.error('   Error details:', error.ApiResponse || error.message);
    throw new Error(`Gagal mendapatkan status transaksi: ${error.message}`);
  }
};

/**
 * Cancel transaksi di Midtrans
 * 
 * @param {string} orderId - Order ID (orderNumber)
 * @returns {Object} - Cancel response
 */
export const cancelTransaction = async (orderId) => {
  try {
    const response = await coreApi.transaction.cancel(orderId);
    return response;
  } catch (error) {
    console.error('❌ Error cancelling transaction:', error);
    throw new Error(`Gagal membatalkan transaksi: ${error.message}`);
  }
};

/**
 * Kembalikan stok produk saat order dibatalkan
 * 
 * @param {Array} orderItems - Array of order items
 */
const restoreStock = async (orderItems) => {
  for (const item of orderItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: { increment: item.quantity },
        sold: { decrement: item.quantity },
      },
    });
  }
  console.log('✅ Stock restored for cancelled order');
};

export default {
  createSnapTransaction,
  handlePaymentNotification,
  getTransactionStatus,
  cancelTransaction,
};

