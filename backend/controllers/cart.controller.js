import prisma from '../utils/prisma.js';

// Get user's cart
export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cartItems = await prisma.cartItem.findMany({
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

    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    res.json({
      success: true,
      data: {
        items: cartItems,
        total,
        itemCount: cartItems.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add item to cart
export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID wajib diisi'
      });
    }

    // Cek apakah produk ada dan stoknya cukup
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Stok produk tidak mencukupi'
      });
    }

    // Cek apakah item sudah ada di cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId)
        }
      }
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + parseInt(quantity);
      
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Stok produk tidak mencukupi'
        });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId: parseInt(productId),
          quantity: parseInt(quantity)
        },
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan ke keranjang',
      data: cartItem
    });
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity harus minimal 1'
      });
    }

    // Cek apakah cart item milik user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(id),
        userId
      },
      include: {
        product: true
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item tidak ditemukan di keranjang'
      });
    }

    // Cek stok
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Stok produk tidak mencukupi'
      });
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity: parseInt(quantity) },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Keranjang berhasil diupdate',
      data: updatedCartItem
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Cek apakah cart item milik user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item tidak ditemukan di keranjang'
      });
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Item berhasil dihapus dari keranjang'
    });
  } catch (error) {
    next(error);
  }
};

// Clear cart
export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'Keranjang berhasil dikosongkan'
    });
  } catch (error) {
    next(error);
  }
};

