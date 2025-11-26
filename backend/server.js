import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import userRoutes from './routes/user.routes.js';
import paymentRoutes from './routes/payment.routes.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS - Allow multiple frontend URLs (flexible)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:3001', // Fallback if frontend uses different port
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (untuk uploaded images)
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Request logging middleware (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
  });
}

// Routes - dengan logging
app.use('/api/auth', (req, res, next) => {
  console.log(`🔐 Auth route accessed: ${req.method} ${req.originalUrl}`);
  next();
}, authRoutes);

app.use('/api/products', (req, res, next) => {
  console.log(`📦 Products route: ${req.method} ${req.originalUrl}`);
  next();
}, productRoutes);

app.use('/api/categories', categoryRoutes);

// Cart routes
console.log('✅ Registering cart routes at /api/cart');
app.use('/api/cart', (req, res, next) => {
  console.log(`🛒 Cart route hit: ${req.method} ${req.originalUrl}`);
  next();
}, cartRoutes);

app.use('/api/orders', orderRoutes);

// Wishlist routes
console.log('✅ Registering wishlist routes at /api/wishlist');
app.use('/api/wishlist', (req, res, next) => {
  console.log(`❤️ Wishlist route hit: ${req.method} ${req.originalUrl}`);
  next();
}, wishlistRoutes);

app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'UNKLAB E-Commerce API is running',
    timestamp: new Date().toISOString(),
    services: {
      database: process.env.DATABASE_URL ? 'configured' : 'not configured',
      midtrans: process.env.MIDTRANS_SERVER_KEY ? 'configured' : 'not configured',
      cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'not configured',
    },
    routes: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      }
    }
  });
});

// 404 handler - harus sebelum error handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  console.log(`   Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    message: `Route tidak ditemukan: ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'GET /api/products',
      'GET /api/categories',
      'GET /api/health'
    ]
  });
});

// Error handler middleware (harus di paling akhir)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 BACKEND SERVER STARTED');
  console.log('='.repeat(50));
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📦 Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`💳 Midtrans: ${process.env.MIDTRANS_SERVER_KEY ? '✅ Configured (' + (process.env.MIDTRANS_IS_PRODUCTION === 'true' ? 'Production' : 'Sandbox') + ')' : '❌ NOT CONFIGURED'}`);
  console.log('\n📋 API Endpoints:');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/login');
  console.log('  GET    /api/auth/me');
  console.log('  GET    /api/products');
  console.log('  GET    /api/categories');
  console.log('  GET    /api/cart');
  console.log('  GET    /api/wishlist');
  console.log('  GET    /api/orders/my-orders');
  console.log('  GET    /api/health');
  console.log('='.repeat(50) + '\n');
});

export default app;

