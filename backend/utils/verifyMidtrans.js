/**
 * Midtrans Signature Verification Utility
 * 
 * Utility untuk memverifikasi signature key dari callback Midtrans
 * PENTING: Selalu verifikasi signature untuk keamanan!
 * 
 * Signature Key Formula:
 * SHA512(order_id + status_code + gross_amount + server_key)
 */

import crypto from 'crypto';

/**
 * Verifikasi signature key dari notification Midtrans
 * 
 * @param {Object} notification - Notification body dari Midtrans
 * @param {string} notification.order_id - Order ID
 * @param {string} notification.status_code - Status code
 * @param {string} notification.gross_amount - Gross amount
 * @param {string} notification.signature_key - Signature dari Midtrans
 * @returns {boolean} - True jika signature valid
 */
export const verifySignature = (notification) => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  
  if (!serverKey) {
    console.error('❌ MIDTRANS_SERVER_KEY tidak ditemukan');
    return false;
  }

  const { order_id, status_code, gross_amount, signature_key } = notification;

  // Generate expected signature
  // Format: SHA512(order_id + status_code + gross_amount + server_key)
  const payload = order_id + status_code + gross_amount + serverKey;
  const expectedSignature = crypto
    .createHash('sha512')
    .update(payload)
    .digest('hex');

  // Compare signatures
  const isValid = expectedSignature === signature_key;

  if (!isValid) {
    console.error('❌ Signature verification failed');
    console.error('Expected:', expectedSignature);
    console.error('Received:', signature_key);
  }

  return isValid;
};

/**
 * Map Midtrans transaction status ke status aplikasi
 * 
 * @param {string} transactionStatus - Status transaksi dari Midtrans
 * @param {string} fraudStatus - Status fraud (jika ada)
 * @returns {Object} - { orderStatus, paymentStatus }
 */
export const mapTransactionStatus = (transactionStatus, fraudStatus = null) => {
  let orderStatus = 'pending';
  let paymentStatus = 'pending';

  switch (transactionStatus) {
    case 'capture':
      // Untuk credit card, cek fraud status
      if (fraudStatus === 'accept') {
        // Payment berhasil, tapi order tetap pending menunggu admin approve
        orderStatus = 'pending';
        paymentStatus = 'paid';
      } else if (fraudStatus === 'challenge') {
        // Butuh review manual
        orderStatus = 'pending';
        paymentStatus = 'pending';
      }
      break;

    case 'settlement':
      // Pembayaran berhasil (untuk semua metode pembayaran)
      // Order tetap pending, admin yang akan ubah status ke processing/completed
      orderStatus = 'pending';
      paymentStatus = 'paid';
      break;

    case 'pending':
      // Menunggu pembayaran
      orderStatus = 'pending';
      paymentStatus = 'pending';
      break;

    case 'deny':
      // Pembayaran ditolak
      orderStatus = 'cancelled';
      paymentStatus = 'cancelled';
      break;

    case 'expire':
      // Pembayaran expired
      orderStatus = 'cancelled';
      paymentStatus = 'expired';
      break;

    case 'cancel':
      // Pembayaran dibatalkan
      orderStatus = 'cancelled';
      paymentStatus = 'cancelled';
      break;

    case 'refund':
      // Pembayaran di-refund
      orderStatus = 'cancelled';
      paymentStatus = 'refund';
      break;

    case 'partial_refund':
      // Sebagian pembayaran di-refund
      paymentStatus = 'partial_refund';
      break;

    default:
      console.warn(`⚠️ Unknown transaction status: ${transactionStatus}`);
  }

  return { orderStatus, paymentStatus };
};

export default {
  verifySignature,
  mapTransactionStatus,
};

