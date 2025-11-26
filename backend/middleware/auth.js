import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware untuk verifikasi JWT token
export const authenticate = async (req, res, next) => {
  try {
    console.log(`🔐 Authenticate middleware called for: ${req.method} ${req.path}`);
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header found');
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan. Silakan login terlebih dahulu.'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Ambil user dari database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          address: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Attach user ke request
      req.user = user;
      console.log(`✅ Authentication successful for user: ${user.email} (ID: ${user.id})`);
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau sudah kadaluarsa'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Middleware untuk verifikasi admin
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Anda harus login terlebih dahulu'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang dapat mengakses.'
    });
  }

  next();
};

// Middleware untuk verifikasi owner (user yang sama atau admin)
export const requireOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Anda harus login terlebih dahulu'
    });
  }

  const resourceUserId = parseInt(req.params.userId || req.body.userId);
  
  if (req.user.role === 'admin' || req.user.id === resourceUserId) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Anda tidak memiliki akses ke resource ini'
    });
  }
};

