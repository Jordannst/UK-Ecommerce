import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Logging middleware untuk debugging
router.use((req, res, next) => {
  console.log(`🛒 Cart route hit: ${req.method} ${req.path}`);
  next();
});

// All cart routes require authentication
router.use(authenticate);

router.get('/', (req, res, next) => {
  console.log('📥 GET /cart - getCart handler called');
  next();
}, getCart);

router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);

export default router;

