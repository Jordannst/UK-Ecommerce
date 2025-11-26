import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.get('/slug/:slug', getCategoryBySlug);

// Admin routes
router.post('/', authenticate, requireAdmin, createCategory);
router.put('/:id', authenticate, requireAdmin, updateCategory);
router.delete('/:id', authenticate, requireAdmin, deleteCategory);

export default router;

