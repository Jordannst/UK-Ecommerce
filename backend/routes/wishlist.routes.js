import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist
} from '../controllers/wishlist.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Logging middleware untuk debugging
router.use((req, res, next) => {
  console.log(`❤️ Wishlist route hit: ${req.method} ${req.path}`);
  next();
});

// All wishlist routes require authentication
router.use(authenticate);

router.get('/', (req, res, next) => {
  console.log('📥 GET /wishlist - getWishlist handler called');
  next();
}, getWishlist);

router.post('/', addToWishlist);
router.delete('/:id', removeFromWishlist);
router.delete('/', clearWishlist);
router.get('/check/:productId', checkWishlist);

export default router;

