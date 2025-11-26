import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import { generateToken } from '../utils/jwt.js';

// Register user baru
export const register = async (req, res, next) => {
  try {
    console.log('📝 Register route hit');
    console.log('📥 Request body:', { 
      name: req.body?.name, 
      email: req.body?.email,
      hasPassword: !!req.body?.password 
    });

    const { name, email, password, phone, address } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi'
      });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: 'user'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken(user.id);

    console.log('✅ Registration successful for:', email);
    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi'
      });
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Kirim response tanpa password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user (me)
export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(address && { address })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile berhasil diupdate',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password lama dan password baru wajib diisi'
      });
    }

    // Ambil user dengan password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password lama tidak sesuai'
      });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    next(error);
  }
};

