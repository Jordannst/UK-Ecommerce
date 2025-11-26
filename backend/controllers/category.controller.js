import prisma from '../utils/prisma.js';

// Get all categories
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// Get category by ID
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Get category by slug
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Create category (Admin only)
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, icon, image } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Nama dan slug wajib diisi'
      });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        image
      }
    });

    res.status(201).json({
      success: true,
      message: 'Kategori berhasil ditambahkan',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Update category (Admin only)
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, image } = req.body;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(image !== undefined && { image })
      }
    });

    res.json({
      success: true,
      message: 'Kategori berhasil diupdate',
      data: category
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }
    next(error);
  }
};

// Delete category (Admin only)
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Cek apakah ada produk yang menggunakan kategori ini
    const productCount = await prisma.product.count({
      where: { categoryId: parseInt(id) }
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus kategori. Masih ada ${productCount} produk yang menggunakan kategori ini.`
      });
    }

    const category = await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Kategori berhasil dihapus',
      data: category
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }
    next(error);
  }
};

