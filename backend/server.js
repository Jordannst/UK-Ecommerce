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

// Import middleware
import errorHandler from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,       // http://localhost:5173
  "http://localhost:3000"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (untuk uploaded images)
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'UNKLAB E-Commerce API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler middleware (harus di paling akhir)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route tidak ditemukan' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📦 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`🌐 CORS enabled untuk: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;

