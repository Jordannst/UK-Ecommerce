import prisma from '../utils/prisma.js';

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

// Create order from cart
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shippingName, shippingPhone, shippingAddress, shippingCity, shippingZip, paymentMethod, notes } = req.body;

    // Validasi
    if (!shippingName || !shippingPhone || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Data pengiriman wajib diisi'
      });
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true
      }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Keranjang kosong'
      });
    }

    // Validasi stok dan hitung total
    let totalAmount = 0;
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stok ${item.product.name} tidak mencukupi`
        });
      }
      totalAmount += item.product.price * item.quantity;
    }

    // Create order dengan transaction
    const order = await prisma.$transaction(async (tx) => {
      // Buat order
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber: generateOrderNumber(),
          status: 'pending',
          totalAmount,
          paymentMethod,
          shippingName,
          shippingPhone,
          shippingAddress,
          shippingCity,
          shippingZip,
          notes
        }
      });

      // Buat order items dan update stok
      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            productName: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            subtotal: item.product.price * item.quantity
          }
        });

        // Update stok dan sold count
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            sold: { increment: item.quantity }
          }
        });
      }

      // Hapus cart items
      await tx.cartItem.deleteMany({
        where: { userId }
      });

      return newOrder;
    });

    // Get order dengan items
    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat',
      data: orderWithItems
    });
  } catch (error) {
    next(error);
  }
};

// Get user's orders
export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const where = {
      userId,
      ...(status && { status })
    };

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// Get order by ID
export const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        userId
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Get order by order number
export const getOrderByNumber = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderNumber } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order
export const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        userId
      },
      include: {
        orderItems: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Hanya pesanan dengan status pending yang bisa dibatalkan'
      });
    }

    // Update order dan kembalikan stok
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'cancelled' }
      });

      // Kembalikan stok
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            sold: { decrement: item.quantity }
          }
        });
      }
    });

    res.json({
      success: true,
      message: 'Pesanan berhasil dibatalkan'
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all orders
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = status ? { status } : {};

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.order.count({ where });

    res.json({
      success: true,
      data: orders,
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

// Admin: Update order status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid'
      });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Status pesanan berhasil diupdate',
      data: order
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan'
      });
    }
    next(error);
  }
};

