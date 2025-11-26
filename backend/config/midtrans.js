/**
 * Midtrans Configuration
 * 
 * Konfigurasi untuk integrasi Midtrans Snap Payment Gateway
 * Mendukung mode Sandbox (testing) dan Production
 * 
 * @see https://docs.midtrans.com/
 */

import midtransClient from 'midtrans-client';

// Validasi environment variables
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY?.trim();
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY?.trim();
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

// Validate configuration
if (!MIDTRANS_SERVER_KEY) {
  console.error('❌ ERROR: MIDTRANS_SERVER_KEY tidak ditemukan di environment variables!');
  console.error('   Tambahkan MIDTRANS_SERVER_KEY ke file backend/.env');
  console.error('   Untuk sandbox, dapatkan dari: https://dashboard.sandbox.midtrans.com/settings/config_info');
}

if (!MIDTRANS_CLIENT_KEY) {
  console.error('❌ ERROR: MIDTRANS_CLIENT_KEY tidak ditemukan di environment variables!');
  console.error('   Tambahkan MIDTRANS_CLIENT_KEY ke file backend/.env');
}

// Check if keys are valid format (should not be empty or just whitespace)
if (MIDTRANS_SERVER_KEY && (MIDTRANS_SERVER_KEY.length < 10 || MIDTRANS_SERVER_KEY.includes('your_'))) {
  console.warn('⚠️  MIDTRANS_SERVER_KEY sepertinya tidak valid atau masih placeholder');
}

if (MIDTRANS_CLIENT_KEY && (MIDTRANS_CLIENT_KEY.length < 10 || MIDTRANS_CLIENT_KEY.includes('your_'))) {
  console.warn('⚠️  MIDTRANS_CLIENT_KEY sepertinya tidak valid atau masih placeholder');
}

/**
 * Midtrans Snap Client
 * Digunakan untuk membuat transaksi dan generate snap token
 */
export const snap = new midtransClient.Snap({
  isProduction: MIDTRANS_IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY || '',
  clientKey: MIDTRANS_CLIENT_KEY || '',
});

// Validate client initialization
if (!MIDTRANS_SERVER_KEY || !MIDTRANS_CLIENT_KEY) {
  console.error('⚠️  Midtrans client tidak dapat diinisialisasi tanpa server key dan client key');
  console.error('   Tambahkan MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY ke backend/.env');
} else {
  // Validate key format
  const isSandbox = !MIDTRANS_IS_PRODUCTION;
  
  if (isSandbox) {
    // Untuk sandbox, format lebih fleksibel:
    // - Server Key: bisa "SB-Mid-server-..." atau "SB-Mid-..."
    // - Client Key: bisa "SB-Mid-client-..." atau "SB-Mid-..."
    const validServerPrefixes = ['SB-Mid-server-', 'SB-Mid-'];
    const validClientPrefixes = ['SB-Mid-client-', 'SB-Mid-'];
    
    const hasValidServerPrefix = validServerPrefixes.some(prefix => 
      MIDTRANS_SERVER_KEY.startsWith(prefix)
    );
    const hasValidClientPrefix = validClientPrefixes.some(prefix => 
      MIDTRANS_CLIENT_KEY.startsWith(prefix)
    );
    
    if (!hasValidServerPrefix) {
      console.warn(`⚠️  MIDTRANS_SERVER_KEY format mungkin salah untuk sandbox.`);
      console.warn(`   Harus dimulai dengan "SB-Mid-server-" atau "SB-Mid-"`);
      console.warn(`   Dapatkan key dari: https://dashboard.sandbox.midtrans.com/settings/config_info`);
    }
    
    if (!hasValidClientPrefix) {
      console.warn(`⚠️  MIDTRANS_CLIENT_KEY format mungkin salah untuk sandbox.`);
      console.warn(`   Harus dimulai dengan "SB-Mid-client-" atau "SB-Mid-"`);
      console.warn(`   Dapatkan key dari: https://dashboard.sandbox.midtrans.com/settings/config_info`);
    }
  } else {
    // Untuk production
    const serverKeyPrefix = 'Mid-server-';
    const clientKeyPrefix = 'Mid-client-';
    
    if (!MIDTRANS_SERVER_KEY.startsWith(serverKeyPrefix)) {
      console.warn(`⚠️  MIDTRANS_SERVER_KEY format mungkin salah untuk production. Harus dimulai dengan "${serverKeyPrefix}"`);
    }
    
    if (!MIDTRANS_CLIENT_KEY.startsWith(clientKeyPrefix)) {
      console.warn(`⚠️  MIDTRANS_CLIENT_KEY format mungkin salah untuk production. Harus dimulai dengan "${clientKeyPrefix}"`);
    }
  }
}

/**
 * Midtrans Core API Client
 * Digunakan untuk operasi lanjutan seperti refund, check status, dll
 */
export const coreApi = new midtransClient.CoreApi({
  isProduction: MIDTRANS_IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY || '',
  clientKey: MIDTRANS_CLIENT_KEY || '',
});

/**
 * Export client key untuk digunakan di frontend
 */
export const clientKey = MIDTRANS_CLIENT_KEY;

/**
 * Check apakah mode production atau sandbox
 */
export const isProduction = MIDTRANS_IS_PRODUCTION;

export default {
  snap,
  coreApi,
  clientKey,
  isProduction,
};

