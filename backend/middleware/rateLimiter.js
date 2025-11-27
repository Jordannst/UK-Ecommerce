import rateLimit from 'express-rate-limit';

/**
 * Rate limiter untuk login endpoint
 * Maksimal 5 request per 1 menit per IP
 */
export const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 5, // Maksimal 5 request per windowMs
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login, coba lagi nanti'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak percobaan login, coba lagi nanti'
    });
  }
});

