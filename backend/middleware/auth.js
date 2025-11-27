import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

// JWT Configuration
const JWT_OPTIONS = {
  issuer: 'starg-ecommerce',
  audience: 'starg-users'
};

/**
 * Middleware untuk verifikasi JWT token (Hardened)
 * Mengambil token dari header Authorization: Bearer <token>
 * Memverifikasi dengan issuer dan audience
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Cek apakah header Authorization ada dan formatnya benar
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan. Silakan login terlebih dahulu.'
      });
    }

    // Extract token dari header
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid'
      });
    }

    try {
      // Verify token dengan issuer dan audience
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: JWT_OPTIONS.issuer,
        audience: JWT_OPTIONS.audience
      });

      // Validasi decoded token
      if (!decoded || !decoded.userId) {
        return res.status(401).json({
          success: false,
          message: 'Token tidak valid'
        });
      }

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
      next();
    } catch (error) {
      // Handle specific JWT errors
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token tidak valid'
        });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token sudah kadaluarsa'
        });
      }

      if (error.name === 'NotBeforeError') {
        return res.status(401).json({
          success: false,
          message: 'Token belum aktif'
        });
      }

      // Generic error
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid'
      });
    }
  } catch (error) {
    // Pass error to error handler
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

