/**
 * Payment Service
 * 
 * Service untuk menangani pembayaran dengan Midtrans di frontend
 */

import api from '../config/api';

const paymentService = {
  /**
   * Get Midtrans configuration (client key, snap URL)
   */
  getConfig: async () => {
    const response = await api.get('/payment/config');
    return response.data.data;
  },

  /**
   * Create payment untuk order
   * @param {number} orderId - ID order yang akan dibayar
   * @returns {Object} - { snapToken, redirectUrl, clientKey }
   */
  createPayment: async (orderId) => {
    const response = await api.post('/payment/create', { orderId });
    return response.data.data;
  },

  /**
   * Check payment status
   * @param {number} orderId - ID order
   */
  checkStatus: async (orderId) => {
    const response = await api.get(`/payment/status/${orderId}`);
    return response.data.data;
  },

  /**
   * Cancel payment
   * @param {number} orderId - ID order
   */
  cancelPayment: async (orderId) => {
    const response = await api.post(`/payment/cancel/${orderId}`);
    return response.data;
  },

  /**
   * Load Midtrans Snap Script
   * @param {string} clientKey - Midtrans client key
   * @param {boolean} isProduction - Production mode atau sandbox
   */
  loadSnapScript: (clientKey, isProduction = false) => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.snap) {
        resolve(window.snap);
        return;
      }

      const script = document.createElement('script');
      script.src = isProduction
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', clientKey);
      script.async = true;

      script.onload = () => {
        resolve(window.snap);
      };

      script.onerror = () => {
        reject(new Error('Failed to load Midtrans Snap script'));
      };

      document.body.appendChild(script);
    });
  },

  /**
   * Open Snap payment popup
   * @param {string} snapToken - Token dari createPayment
   * @param {Object} callbacks - Callback functions
   */
  openSnapPopup: (snapToken, callbacks = {}) => {
    if (!window.snap) {
      throw new Error('Midtrans Snap belum di-load. Panggil loadSnapScript terlebih dahulu.');
    }

    window.snap.pay(snapToken, {
      onSuccess: (result) => {
        console.log('✅ Payment success:', result);
        callbacks.onSuccess?.(result);
      },
      onPending: (result) => {
        console.log('⏳ Payment pending:', result);
        callbacks.onPending?.(result);
      },
      onError: (result) => {
        console.error('❌ Payment error:', result);
        callbacks.onError?.(result);
      },
      onClose: () => {
        console.log('🚪 Payment popup closed');
        callbacks.onClose?.();
      },
    });
  },

  /**
   * Open Snap embed (dalam container)
   * @param {string} snapToken - Token dari createPayment
   * @param {string} containerId - ID container HTML element
   * @param {Object} callbacks - Callback functions
   */
  openSnapEmbed: (snapToken, containerId, callbacks = {}) => {
    if (!window.snap) {
      throw new Error('Midtrans Snap belum di-load. Panggil loadSnapScript terlebih dahulu.');
    }

    window.snap.embed(snapToken, {
      embedId: containerId,
      onSuccess: (result) => {
        console.log('✅ Payment success:', result);
        callbacks.onSuccess?.(result);
      },
      onPending: (result) => {
        console.log('⏳ Payment pending:', result);
        callbacks.onPending?.(result);
      },
      onError: (result) => {
        console.error('❌ Payment error:', result);
        callbacks.onError?.(result);
      },
      onClose: () => {
        console.log('🚪 Payment embed closed');
        callbacks.onClose?.();
      },
    });
  },
};

export default paymentService;

