/**
 * Email Service
 * 
 * Service untuk mengirim email menggunakan nodemailer (SMTP) atau EngageLab REST API
 * Mendukung Gmail, EngageLab REST API, SMTP custom, dan service email lainnya
 */

import nodemailer from 'nodemailer';
import axios from 'axios';

// Konfigurasi email dari environment variables
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'smtp'; // 'smtp' atau 'engagelab'
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10);
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER || 'noreply@starg.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Starg';
const STORE_NAME = process.env.STORE_NAME || 'Starg';

// EngageLab REST API Configuration
const ENGAGELAB_API_USER = process.env.ENGAGELAB_API_USER || '';
const ENGAGELAB_API_KEY = process.env.ENGAGELAB_API_KEY || '';
const ENGAGELAB_API_URL = process.env.ENGAGELAB_API_URL || 'https://email.api.engagelab.cc/v1/mail/send';
const ENGAGELAB_FROM_EMAIL = process.env.ENGAGELAB_FROM_EMAIL || '';

// Validasi konfigurasi
const isEmailConfigured = EMAIL_PROVIDER === 'engagelab' 
  ? (ENGAGELAB_API_USER && ENGAGELAB_API_KEY && ENGAGELAB_FROM_EMAIL)
  : (EMAIL_USER && EMAIL_PASSWORD);

if (!isEmailConfigured) {
  if (EMAIL_PROVIDER === 'engagelab') {
    console.warn('⚠️  Email service (EngageLab) tidak dikonfigurasi.');
    console.warn('   Tambahkan ENGAGELAB_API_USER, ENGAGELAB_API_KEY, dan ENGAGELAB_FROM_EMAIL di .env');
  } else {
    console.warn('⚠️  Email service (SMTP) tidak dikonfigurasi.');
    console.warn('   Tambahkan EMAIL_USER dan EMAIL_PASSWORD di .env');
  }
  console.warn('   Email tidak akan dikirim sampai konfigurasi selesai.');
}

/**
 * Buat transporter untuk nodemailer
 */
const createTransporter = () => {
  if (!isEmailConfigured) {
    return null;
  }

  // Konfigurasi untuk Gmail
  if (EMAIL_HOST.includes('gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD, // App Password untuk Gmail
      },
    });
  }

  // Konfigurasi untuk EngageLab
  if (EMAIL_HOST.includes('engagelab.com')) {
    return nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465, // true untuk 465, false untuk port lain
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
      // EngageLab biasanya menggunakan TLS
      tls: {
        ciphers: 'SSLv3',
      },
    });
  }

  // Konfigurasi SMTP custom
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true untuk 465, false untuk port lain
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });
};

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
 * Kirim email menggunakan EngageLab REST API
 * 
 * @param {string} to - Email penerima
 * @param {string} subject - Subject email
 * @param {string} htmlContent - HTML content
 * @returns {Promise<Object>} - API response
 */
const sendEmailViaEngageLab = async (to, subject, htmlContent) => {
  try {
    const response = await axios.post(
      ENGAGELAB_API_URL,
      {
        from: ENGAGELAB_FROM_EMAIL,
        to: [to],
        body: {
          subject: subject,
          content: {
            html: htmlContent,
          },
        },
      },
      {
        auth: {
          username: ENGAGELAB_API_USER,
          password: ENGAGELAB_API_KEY,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ EngageLab API Error:');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Message: ${error.response?.data || error.message}`);
    throw new Error(`EngageLab API error: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Kirim email order confirmation
 * 
 * @param {Object} order - Order object dengan orderItems
 * @param {Object} user - User object
 * @returns {Promise<Object>} - Email send result
 */
export const sendOrderConfirmationEmail = async (order, user) => {
  if (!isEmailConfigured) {
    console.warn('⚠️  Email tidak dikirim karena konfigurasi email belum lengkap');
    console.warn(`   Order ${order.orderNumber} - Email: ${user.email}`);
    return { success: false, message: 'Email service not configured' };
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

    // Gunakan EngageLab REST API jika dikonfigurasi
    if (EMAIL_PROVIDER === 'engagelab') {
      const result = await sendEmailViaEngageLab(user.email, subject, htmlContent);
      
      console.log('✅ Email order confirmation berhasil dikirim via EngageLab:');
      console.log(`   To: ${user.email}`);
      console.log(`   Order: ${order.orderNumber}`);
      console.log(`   Response:`, result.data);

      return {
        success: true,
        provider: 'engagelab',
        to: user.email,
        data: result.data,
      };
    }

    // Gunakan SMTP (nodemailer) untuk provider lain
    const transporter = createTransporter();
    if (!transporter) {
      throw new Error('Email transporter tidak dapat dibuat');
    }

    const mailOptions = {
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
      to: user.email,
      subject: subject,
      html: htmlContent,
      text: textContent,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email order confirmation berhasil dikirim via SMTP:');
    console.log(`   To: ${user.email}`);
    console.log(`   Order: ${order.orderNumber}`);
    console.log(`   Message ID: ${info.messageId}`);

    return {
      success: true,
      provider: 'smtp',
      messageId: info.messageId,
      to: user.email,
    };
  } catch (error) {
    console.error('❌ Error sending order confirmation email:');
    console.error(`   Order: ${order.orderNumber}`);
    console.error(`   To: ${user.email}`);
    console.error(`   Provider: ${EMAIL_PROVIDER}`);
    console.error(`   Error: ${error.message}`);
    
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Test email configuration
 */
export const testEmailConnection = async () => {
  if (!isEmailConfigured) {
    return {
      success: false,
      message: 'Email service tidak dikonfigurasi',
      provider: EMAIL_PROVIDER,
    };
  }

  try {
    if (EMAIL_PROVIDER === 'engagelab') {
      // Test EngageLab API dengan email test
      const testEmail = process.env.TEST_EMAIL || 'test@example.com';
      const result = await sendEmailViaEngageLab(
        testEmail,
        `Test Email from ${STORE_NAME}`,
        `<h1>Test Email</h1><p>This is a test email from ${STORE_NAME} email service.</p>`
      );
      
      return {
        success: true,
        message: 'EngageLab API berhasil dikonfigurasi',
        provider: 'engagelab',
        data: result.data,
      };
    }

    // Test SMTP connection
    const transporter = createTransporter();
    if (!transporter) {
      throw new Error('Email transporter tidak dapat dibuat');
    }

    await transporter.verify();
    
    return {
      success: true,
      message: 'SMTP email service berhasil dikonfigurasi',
      provider: 'smtp',
    };
  } catch (error) {
    return {
      success: false,
      message: `Email service error: ${error.message}`,
      provider: EMAIL_PROVIDER,
    };
  }
};

export default {
  sendOrderConfirmationEmail,
  testEmailConnection,
  isEmailConfigured,
  emailProvider: EMAIL_PROVIDER,
};

