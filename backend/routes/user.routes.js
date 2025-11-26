import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStatistics
} from '../controllers/user.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All user routes require admin authentication
router.use(authenticate, requireAdmin);

router.get('/', getAllUsers);
router.get('/statistics', getUserStatistics);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;

