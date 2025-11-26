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
    console.log('📦 Create Product Request:', {
      body: req.body,
      file: req.file ? 'File received' : 'No file',
      contentType: req.headers['content-type']
    });

    const { name, description, price, stock, categoryId, faculty, ukm, seller, image } = req.body;

    // Validasi
    if (!name || !description || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Nama, deskripsi, harga, dan kategori wajib diisi'
      });
    }

    // Validasi category exists
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) }
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Kategori tidak ditemukan. Silakan pilih kategori yang valid.'
      });
    }

    // Jika ada file upload ke Cloudinary
    let imageUrl = image;
    if (req.file) {
      // Cloudinary akan otomatis upload dan return secure_url
      imageUrl = req.file.path; // Cloudinary secure_url
      console.log('✅ Image uploaded to Cloudinary:', imageUrl);
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
        faculty: faculty || null,
        ukm: ukm || null,
        seller: seller || null,
        image: imageUrl
      },
      include: {
        category: true
      }
    });

    console.log('✅ Product created successfully:', product.id);
    res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan',
      data: product
    });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Data duplikat atau constraint violation'
      });
    }
    if (error.code === 'P2003') {
      // Foreign key constraint violation - category tidak ditemukan
      return res.status(400).json({
        success: false,
        message: 'Kategori tidak ditemukan. Silakan pilih kategori yang valid.'
      });
    }
    next(error);
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);
    
    console.log('📝 Update Product Request:', {
      id: productId,
      body: req.body,
      file: req.file ? 'File received' : 'No file',
      contentType: req.headers['content-type']
    });

    // Cek apakah produk ada
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    // Parse body fields (FormData sends everything as strings)
    const { name, description, price, stock, categoryId, faculty, ukm, seller, image } = req.body;

    // Jika ada file upload baru ke Cloudinary
    let imageUrl = image || existingProduct.image;
    if (req.file) {
      // Upload gambar baru ke Cloudinary
      imageUrl = req.file.path; // Cloudinary secure_url
      console.log('✅ New image uploaded to Cloudinary:', imageUrl);
      
      // Hapus gambar lama dari Cloudinary (jika ada dan dari Cloudinary)
      if (existingProduct.image && existingProduct.image.includes('cloudinary.com')) {
        console.log('🗑️ Deleting old image from Cloudinary:', existingProduct.image);
        try {
          const deleteResult = await deleteImageFromCloudinary(existingProduct.image);
          if (deleteResult.success) {
            console.log('✅ Old image deleted successfully');
          } else {
            console.log('⚠️ Failed to delete old image:', deleteResult.message);
          }
        } catch (cloudinaryError) {
          console.error('❌ Error deleting old image from Cloudinary:', cloudinaryError);
          // Continue dengan update meskipun gagal hapus image lama
        }
      }
    }

    // Build update data object - always include image
    const updateData = {
      image: imageUrl
    };

    // Handle string fields - only update if provided and not empty
    if (name !== undefined && name !== null && name !== '') {
      updateData.name = name;
    }
    if (description !== undefined && description !== null && description !== '') {
      updateData.description = description;
    }
    if (price !== undefined && price !== null && price !== '') {
      const parsedPrice = parseFloat(price);
      if (!isNaN(parsedPrice)) {
        updateData.price = parsedPrice;
      }
    }
    if (stock !== undefined && stock !== null && stock !== '') {
      const parsedStock = parseInt(stock);
      if (!isNaN(parsedStock)) {
        updateData.stock = parsedStock;
      }
    }
    if (categoryId !== undefined && categoryId !== null && categoryId !== '') {
      const parsedCategoryId = parseInt(categoryId);
      if (!isNaN(parsedCategoryId)) {
        updateData.categoryId = parsedCategoryId;
      }
    }
    // Optional fields - can be set to empty string to clear
    if (faculty !== undefined) {
      updateData.faculty = faculty || null;
    }
    if (ukm !== undefined) {
      updateData.ukm = ukm || null;
    }
    if (seller !== undefined) {
      updateData.seller = seller || null;
    }

    console.log('📝 Update data:', updateData);

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        category: true
      }
    });

    console.log('✅ Product updated successfully:', product.id);
    res.json({
      success: true,
      message: 'Produk berhasil diupdate',
      data: product
    });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Data duplikat atau constraint violation'
      });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }
    next(error);
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    console.log('🗑️ Delete Product Request:', { id: productId });

    // Get product first untuk ambil image URL dan cek dependencies
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        orderItems: {
          select: { id: true }
        },
        _count: {
          select: {
            orderItems: true,
            cartItems: true,
            wishlistItems: true
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

    console.log('📊 Product dependencies:', {
      orderItems: product._count.orderItems,
      cartItems: product._count.cartItems,
      wishlistItems: product._count.wishlistItems
    });

    // Cek apakah produk sudah pernah dipesan (OrderItem dengan onDelete: Restrict)
    if (product._count.orderItems > 0) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus produk. Produk ini sudah pernah dipesan (${product._count.orderItems} pesanan). Untuk menjaga integritas data, produk yang sudah pernah dipesan tidak dapat dihapus.`
      });
    }

    // Hapus gambar dari Cloudinary (jika ada dan dari Cloudinary)
    if (product.image && product.image.includes('cloudinary.com')) {
      console.log('🗑️ Deleting product image from Cloudinary:', product.image);
      try {
        const deleteResult = await deleteImageFromCloudinary(product.image);
        if (deleteResult.success) {
          console.log('✅ Product image deleted successfully from Cloudinary');
        } else {
          console.log('⚠️ Failed to delete product image from Cloudinary:', deleteResult.message);
          // Continue dengan delete product meskipun gagal hapus image
        }
      } catch (cloudinaryError) {
        console.error('❌ Error deleting image from Cloudinary:', cloudinaryError);
        // Continue dengan delete product meskipun gagal hapus image
      }
    }

    // Delete product dari database
    // CartItems dan WishlistItems akan otomatis terhapus karena onDelete: Cascade
    await prisma.product.delete({
      where: { id: productId }
    });

    console.log('✅ Product deleted successfully:', productId);
    res.json({
      success: true,
      message: 'Produk dan gambar berhasil dihapus',
      data: product
    });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    
    // Handle Prisma errors
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }
    
    // Handle foreign key constraint violation
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus produk. Produk ini masih digunakan dalam pesanan atau data lain.'
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

