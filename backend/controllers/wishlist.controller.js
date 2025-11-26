import prisma from '../utils/prisma.js';

// Get user's wishlist
export const getWishlist = async (req, res, next) => {
  try {
    console.log('❤️ getWishlist controller called, userId:', req.user?.id);
    const userId = req.user.id;

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: wishlistItems
    });
  } catch (error) {
    next(error);
  }
};

// Add item to wishlist
export const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID wajib diisi'
      });
    }

    // Cek apakah produk ada
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    // Cek apakah sudah ada di wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId)
        }
      }
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Produk sudah ada di wishlist'
      });
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId,
        productId: parseInt(productId)
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan ke wishlist',
      data: wishlistItem
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Cek apakah wishlist item milik user
    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Item tidak ditemukan di wishlist'
      });
    }

    await prisma.wishlistItem.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Item berhasil dihapus dari wishlist'
    });
  } catch (error) {
    next(error);
  }
};

// Clear wishlist
export const clearWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await prisma.wishlistItem.deleteMany({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'Wishlist berhasil dikosongkan'
    });
  } catch (error) {
    next(error);
  }
};

// Check if product is in wishlist
export const checkWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId)
        }
      }
    });

    res.json({
      success: true,
      data: {
        inWishlist: !!wishlistItem
      }
    });
  } catch (error) {
    next(error);
  }
};

