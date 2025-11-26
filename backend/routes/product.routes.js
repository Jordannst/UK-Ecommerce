import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSimilarProducts
} from '../controllers/product.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/:id/similar', getSimilarProducts);

// Admin routes - menggunakan Cloudinary upload
router.post('/', authenticate, requireAdmin, upload.single('image'), createProduct);
router.put('/:id', authenticate, requireAdmin, upload.single('image'), updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

export default router;

