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

// Helper function to generate slug
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Create category (Admin only)
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, icon, image } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori wajib diisi'
      });
    }

    // Auto-generate slug if not provided
    const finalSlug = slug || generateSlug(name);

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
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
    // Handle unique constraint violation (duplicate slug)
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Slug sudah digunakan. Silakan gunakan slug yang berbeda.'
      });
    }
    next(error);
  }
};

// Update category (Admin only)
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, image } = req.body;

    // If name is updated but slug is not, auto-generate slug from name
    let finalSlug = slug;
    if (name && !slug) {
      finalSlug = generateSlug(name);
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(finalSlug && { slug: finalSlug }),
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
    // Handle unique constraint violation (duplicate slug)
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Slug sudah digunakan. Silakan gunakan slug yang berbeda.'
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

