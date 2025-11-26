import prisma from '../utils/prisma.js';
import bcrypt from 'bcryptjs';

// Admin: Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.user.count({ where });

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    name: true,
                    image: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            orders: true,
            cartItems: true,
            wishlistItems: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update user
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, address, password } = req.body;

    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address })
    };

    // Jika ada password baru, hash dulu
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
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
      message: 'User berhasil diupdate',
      data: user
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    next(error);
  }
};

// Admin: Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Tidak boleh hapus diri sendiri
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus akun sendiri'
      });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'User berhasil dihapus'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    next(error);
  }
};

// Get user statistics (Admin)
export const getUserStatistics = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalAdmins = await prisma.user.count({ where: { role: 'admin' } });
    const totalCustomers = await prisma.user.count({ where: { role: 'user' } });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalCustomers,
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

