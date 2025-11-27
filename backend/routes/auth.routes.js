import express from 'express';
import { register, login, getMe, updateProfile, changePassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import { sanitizeInput } from '../middleware/sanitizeInput.js';
import { validateRegister, validateLogin, validateUpdateProfile } from '../middleware/validateInput.js';

const router = express.Router();

// Public routes

// Register route: sanitize → validate → register
router.post('/register', 
  sanitizeInput,      // Sanitasi input (name, phone, address)
  validateRegister,   // Validasi email, password, name
  register
);

// Login route: rate limit → validate → login
router.post('/login', 
  loginRateLimiter,  // Rate limiting: max 5 requests per minute
  validateLogin,     // Validasi email dan password
  login
);

// Protected routes (require authentication)
router.get('/me', authenticate, getMe);

// Update profile: authenticate → sanitize → validate → update
router.put('/profile', 
  authenticate, 
  sanitizeInput,      // Sanitasi input (name, phone, address)
  validateUpdateProfile, // Validasi name jika ada
  updateProfile
);

router.put('/change-password', authenticate, changePassword);

export default router;

