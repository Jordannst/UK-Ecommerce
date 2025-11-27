// Global error handler middleware
// Proteksi error exposure - tidak menampilkan error internal ke client
const errorHandler = (err, req, res, next) => {
  // Log error untuk debugging (hanya di server)
  console.error('❌ Error:', {
    message: err.message,
    code: err.code,
    name: err.name,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Prisma error handling - HIDE internal errors
  if (err.code && err.code.startsWith('P')) {
    // Semua error Prisma disembunyikan
    if (err.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Data sudah ada (duplicate entry)'
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan'
      });
    }

    // Semua error Prisma lainnya disembunyikan
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }

  // Database connection errors
  if (err.name === 'PrismaClientKnownRequestError' || 
      err.name === 'PrismaClientUnknownRequestError' ||
      err.name === 'PrismaClientRustPanicError' ||
      err.name === 'PrismaClientInitializationError') {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }

  // JWT error handling
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token sudah kadaluarsa'
    });
  }

  // Validation errors (dari validator atau custom)
  if (err.name === 'ValidationError' || err.statusCode === 400) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Validasi gagal'
    });
  }

  // Default error - HIDE internal details
  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    success: false,
    message: err.message && isDevelopment 
      ? err.message 
      : 'Terjadi kesalahan pada server',
    // Hanya tampilkan error details di development
    ...(isDevelopment && { 
      error: err.stack,
      details: err 
    })
  });
};

export default errorHandler;

