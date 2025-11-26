import prisma from '../utils/prisma.js';
import { deleteImageFromCloudinary } from '../config/cloudinary.js';

// Get all products dengan filter dan pagination
export const getAllProducts = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search = '', 
      categoryId, 
      minPrice, 
      maxPrice,
      faculty,
      ukm,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(categoryId && { categoryId: parseInt(categoryId) }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
      ...(faculty && { faculty: { contains: faculty, mode: 'insensitive' } }),
      ...(ukm && { ukm: { contains: ukm, mode: 'insensitive' } })
    };

    // Get products
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: parseInt(limit)
    });

    // Get total count
    const total = await prisma.product.count({ where });

    res.json({
      success: true,
      data: products,
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

// Get product by ID
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Create product (Admin only)
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId, faculty, ukm, seller, image } = req.body;

    // Validasi
    if (!name || !description || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Nama, deskripsi, harga, dan kategori wajib diisi'
      });
    }

    // Jika ada file upload ke Cloudinary
    let imageUrl = image;
    if (req.file) {
      // Cloudinary akan otomatis upload dan return secure_url
      imageUrl = req.file.path; // Cloudinary secure_url
      console.log('Image uploaded to Cloudinary:', imageUrl);
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Gambar produk wajib diisi'
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        categoryId: parseInt(categoryId),
        faculty,
        ukm,
        seller,
        image: imageUrl
      },
      include: {
        category: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, categoryId, faculty, ukm, seller, image } = req.body;

    // Cek apakah produk ada
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    // Jika ada file upload baru ke Cloudinary
    let imageUrl = image || existingProduct.image;
    if (req.file) {
      // Upload gambar baru ke Cloudinary
      imageUrl = req.file.path; // Cloudinary secure_url
      console.log('New image uploaded to Cloudinary:', imageUrl);
      
      // Hapus gambar lama dari Cloudinary (jika ada dan dari Cloudinary)
      if (existingProduct.image && existingProduct.image.includes('cloudinary.com')) {
        console.log('Deleting old image from Cloudinary:', existingProduct.image);
        const deleteResult = await deleteImageFromCloudinary(existingProduct.image);
        if (deleteResult.success) {
          console.log('Old image deleted successfully');
        } else {
          console.log('Failed to delete old image:', deleteResult.message);
        }
      }
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(faculty !== undefined && { faculty }),
        ...(ukm !== undefined && { ukm }),
        ...(seller !== undefined && { seller }),
        image: imageUrl
      },
      include: {
        category: true
      }
    });

    res.json({
      success: true,
      message: 'Produk berhasil diupdate',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get product first untuk ambil image URL
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    // Hapus gambar dari Cloudinary (jika ada dan dari Cloudinary)
    if (product.image && product.image.includes('cloudinary.com')) {
      console.log('Deleting product image from Cloudinary:', product.image);
      const deleteResult = await deleteImageFromCloudinary(product.image);
      if (deleteResult.success) {
        console.log('Product image deleted successfully from Cloudinary');
      } else {
        console.log('Failed to delete product image from Cloudinary:', deleteResult.message);
        // Continue dengan delete product meskipun gagal hapus image
      }
    }

    // Delete product dari database
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Produk dan gambar berhasil dihapus',
      data: product
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }
    next(error);
  }
};

// Get similar products
export const getSimilarProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    const similarProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id }
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: similarProducts
    });
  } catch (error) {
    next(error);
  }
};

