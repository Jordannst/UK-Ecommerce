// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma error handling
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'Data sudah ada (duplicate entry)',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Data tidak ditemukan',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
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

  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorHandler;

