/**
 * Email Service menggunakan Resend
 * 
 * Resend adalah modern email API yang reliable dan mudah digunakan
 * Free tier: 100 emails/day, 3,000 emails/month
 * 
 * Setup:
 * 1. Daftar di https://resend.com
 * 2. Buat API key
 * 3. Verifikasi domain (optional, bisa pakai default)
 * 4. Tambahkan RESEND_API_KEY di .env
 */

import { Resend } from 'resend';

// Konfigurasi dari environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev'; // Default Resend email
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Starg E-Commerce';
const STORE_NAME = process.env.STORE_NAME || 'Starg';

// Validasi konfigurasi
const isEmailConfigured = !!RESEND_API_KEY;

if (!isEmailConfigured) {
  console.warn('⚠️  Email service (Resend) tidak dikonfigurasi.');
  console.warn('   Tambahkan RESEND_API_KEY di .env');
  console.warn('   Daftar di https://resend.com untuk mendapatkan API key');
  console.warn('   Email tidak akan dikirim sampai konfigurasi selesai.');
}

// Initialize Resend client
let resend = null;
if (isEmailConfigured) {
  try {
    resend = new Resend(RESEND_API_KEY);
    console.log('✅ Resend email service initialized');
  } catch (error) {
    console.error('❌ Error initializing Resend:', error.message);
    console.warn('   Email service tidak akan berfungsi');
  }
}

/**
 * Format harga ke Rupiah
 */
const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

/**
 * Format tanggal ke format Indonesia
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Template HTML untuk email order confirmation
 */
const getOrderConfirmationTemplate = (order, user) => {
  const orderItemsHtml = order.orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.productName}</strong><br>
          <span style="color: #6b7280; font-size: 14px;">Qty: ${item.quantity} × ${formatPrice(item.price)}</span>
        </td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 600;">
          ${formatPrice(item.subtotal)}
        </td>
      </tr>
    `
    )
    .join('');

  const paymentStatusLabel = {
    paid: 'Sudah Dibayar',
    pending: 'Menunggu Pembayaran',
    expired: 'Kadaluarsa',
    cancelled: 'Dibatalkan',
  };

  const orderStatusLabel = {
    pending: 'Menunggu Konfirmasi',
    processing: 'Sedang Diproses',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konfirmasi Pesanan - ${STORE_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🎉 Pesanan Berhasil!
              </h1>
              <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">
                Terima kasih telah berbelanja di ${STORE_NAME}
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Halo <strong>${user.name}</strong>,
              </p>
              
              <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Pesanan Anda telah berhasil dibuat dan pembayaran telah diterima. Berikut detail pesanan Anda:
              </p>
              
              <!-- Order Info Card -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #3b82f6;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Nomor Pesanan:</td>
                    <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 600; font-size: 14px;">${order.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Tanggal Pesanan:</td>
                    <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 600; font-size: 14px;">${formatDate(order.createdAt)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Status Pembayaran:</td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="background-color: #10b981; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                        ${paymentStatusLabel[order.paymentStatus] || order.paymentStatus}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Status Pesanan:</td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="background-color: #3b82f6; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                        ${orderStatusLabel[order.status] || order.status}
                      </span>
                    </td>
                  </tr>
                  ${order.paymentType ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Metode Pembayaran:</td>
                    <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 600; font-size: 14px;">${order.paymentType}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <!-- Order Items -->
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 700;">
                Detail Pesanan
              </h2>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 14px; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Item</th>
                    <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 14px; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>
              
              <!-- Total -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 12px 0; text-align: right; border-top: 2px solid #e5e7eb;">
                    <div style="display: inline-block; text-align: right;">
                      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Total Pesanan:</p>
                      <p style="margin: 0; color: #1f2937; font-size: 24px; font-weight: 700;">
                        ${formatPrice(order.totalAmount)}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Shipping Info -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px; font-weight: 700;">
                  📦 Alamat Pengiriman
                </h3>
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.8;">
                  <strong>${order.shippingName}</strong><br>
                  ${order.shippingPhone}<br>
                  ${order.shippingAddress}<br>
                  ${order.shippingCity || ''}${order.shippingZip ? ` ${order.shippingZip}` : ''}
                </p>
              </div>
              
              <!-- Next Steps -->
              <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #3b82f6;">
                <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px; font-weight: 700;">
                  📋 Langkah Selanjutnya
                </h3>
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.8;">
                  Pesanan Anda sedang diproses. Kami akan mengirimkan notifikasi ketika pesanan dikirim. 
                  Anda dapat melacak status pesanan di dashboard akun Anda.
                </p>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                       style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Lihat Detail Pesanan
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Footer -->
              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                Jika Anda memiliki pertanyaan, silakan hubungi customer service kami.<br>
                <strong>${STORE_NAME}</strong> - Platform E-Commerce
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Kirim email order confirmation menggunakan Resend
 * 
 * @param {Object} order - Order object dengan orderItems
 * @param {Object} user - User object
 * @returns {Promise<Object>} - Email send result
 */
export const sendOrderConfirmationEmail = async (order, user) => {
  // Validasi user dan email
  if (!user) {
    console.error('❌ User tidak ditemukan untuk mengirim email');
    return {
      success: false,
      message: 'User not found',
      provider: 'resend'
    };
  }

  if (!user.email) {
    console.error('❌ Email user tidak ditemukan');
    console.error(`   User ID: ${user.id}`);
    console.error(`   User Name: ${user.name}`);
    return {
      success: false,
      message: 'User email not found',
      provider: 'resend'
    };
  }

  console.log('📧 sendOrderConfirmationEmail called');
  console.log(`   Order: ${order.orderNumber}`);
  console.log(`   User: ${user.name} (${user.email})`);
  console.log(`   Resend configured: ${isEmailConfigured}`);
  console.log(`   Resend client: ${resend ? 'initialized' : 'not initialized'}`);

  if (!isEmailConfigured || !resend) {
    console.error('❌ Email tidak dikirim karena konfigurasi email belum lengkap');
    console.error(`   Order ${order.orderNumber} - Email: ${user.email}`);
    console.error('   RESEND_API_KEY:', RESEND_API_KEY ? 'Ada (tapi mungkin invalid)' : 'TIDAK ADA');
    console.error('   Pastikan RESEND_API_KEY sudah ditambahkan di .env');
    console.error('   Lihat backend/EMAIL_SETUP.md untuk panduan setup');
    return { 
      success: false, 
      message: 'Email service not configured',
      provider: 'resend',
      error: 'RESEND_API_KEY not configured'
    };
  }

  try {
    // Pastikan order memiliki orderItems
    let orderWithItems = order;
    if (!order.orderItems || order.orderItems.length === 0) {
      const { default: prisma } = await import('../utils/prisma.js');
      orderWithItems = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    const subject = `🎉 Pesanan Berhasil - ${order.orderNumber} | ${STORE_NAME}`;
    const htmlContent = getOrderConfirmationTemplate(orderWithItems, user);
    const textContent = `
Pesanan Berhasil - ${order.orderNumber}

Halo ${user.name},

Pesanan Anda telah berhasil dibuat dan pembayaran telah diterima.

Nomor Pesanan: ${order.orderNumber}
Tanggal: ${formatDate(order.createdAt)}
Total: ${formatPrice(order.totalAmount)}

Detail pesanan lengkap dapat dilihat di dashboard akun Anda.

Terima kasih telah berbelanja di ${STORE_NAME}!
    `.trim();

    // Kirim email menggunakan Resend
    const { data, error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: [user.email],
      subject: subject,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      throw new Error(error.message || 'Failed to send email');
    }

    console.log('✅ Email order confirmation berhasil dikirim via Resend:');
    console.log(`   To: ${user.email}`);
    console.log(`   Order: ${order.orderNumber}`);
    console.log(`   Email ID: ${data?.id || 'N/A'}`);

    return {
      success: true,
      provider: 'resend',
      emailId: data?.id,
      to: user.email,
    };
  } catch (error) {
    console.error('❌ Error sending order confirmation email:');
    console.error(`   Order: ${order.orderNumber}`);
    console.error(`   To: ${user.email}`);
    console.error(`   Provider: Resend`);
    console.error(`   Error: ${error.message}`);
    
    // Log error details untuk debugging
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response:`, error.response.data);
    }
    
    return {
      success: false,
      error: error.message,
      provider: 'resend',
    };
  }
};

/**
 * Test email configuration
 */
export const testEmailConnection = async () => {
  if (!isEmailConfigured || !resend) {
    return {
      success: false,
      message: 'Email service tidak dikonfigurasi',
      provider: 'resend',
      instructions: [
        '1. Daftar di https://resend.com',
        '2. Buat API key di dashboard',
        '3. Tambahkan RESEND_API_KEY di .env',
        '4. (Optional) Verifikasi domain untuk menggunakan email custom',
      ],
    };
  }

  try {
    const testEmail = process.env.TEST_EMAIL || 'delivered@resend.dev';
    
    // Test send email
    const { data, error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: [testEmail],
      subject: `Test Email from ${STORE_NAME}`,
      html: `<h1>Test Email</h1><p>This is a test email from ${STORE_NAME} email service using Resend.</p>`,
      text: `Test Email\n\nThis is a test email from ${STORE_NAME} email service using Resend.`,
    });

    if (error) {
      throw new Error(error.message || 'Failed to send test email');
    }

    return {
      success: true,
      message: 'Resend email service berhasil dikonfigurasi',
      provider: 'resend',
      emailId: data?.id,
      testEmail: testEmail,
    };
  } catch (error) {
    return {
      success: false,
      message: `Email service error: ${error.message}`,
      provider: 'resend',
      error: error.response?.data || error.message,
    };
  }
};

export default {
  sendOrderConfirmationEmail,
  testEmailConnection,
  isEmailConfigured,
  emailProvider: 'resend',
};
