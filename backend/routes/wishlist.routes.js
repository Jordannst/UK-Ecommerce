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

// All wishlist routes require authentication
router.use(authenticate);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:id', removeFromWishlist);
router.delete('/', clearWishlist);
router.get('/check/:productId', checkWishlist);

export default router;

