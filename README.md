# 🛍️ UNKLAB Campus E-Commerce Platform

Platform e-commerce modern untuk kampus UNKLAB yang dibangun dengan **React + Vite + Tailwind CSS** untuk frontend dan **Node.js + Express + PostgreSQL + Prisma** untuk backend.
---

## 📋 Fitur Utama

### 👤 User Features
- ✅ **Autentikasi**: Login & Register dengan JWT
- ✅ **Browse Products**: Filter, search, dan pagination
- ✅ **Shopping Cart**: Tambah, update, dan hapus item (requires login)
- ✅ **Checkout**: Form pemesanan dengan validasi
- ✅ **Order History**: Lacak status pesanan
- ✅ **Wishlist**: Simpan produk favorit
- ✅ **User Dashboard**: Edit profile dan order history
- ✅ **Protected Routes**: Semua transaksi require authentication

### 👨‍💼 Admin Features
- ✅ **Product Management**: CRUD products dengan upload gambar ke **Cloudinary Cloud**
- ✅ **Category Management**: CRUD categories dengan validation
- ✅ **Order Management**: Update status pesanan & track orders
- ✅ **User Management**: View, edit, dan manage users
- ✅ **Dashboard Statistics**: Overview penjualan dan analytics
- ✅ **Auto Image Management**: Images otomatis dihapus dari Cloudinary saat delete/update produk
- ✅ **Role-Based Access**: Hanya admin yang bisa akses admin panel

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Library
- **Vite 5** - Lightning-fast build tool & dev server
- **Tailwind CSS 3** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client dengan interceptors
- **Context API** - State management (Auth, Cart, Wishlist)

### Backend
- **Node.js v18+** - JavaScript runtime
- **Express.js 5** - Web application framework
- **PostgreSQL 14+** - Relational database (production-ready)
- **Prisma 5.22** - Next-generation ORM
- **JWT (jsonwebtoken)** - Secure authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Cloud image storage & CDN
- **Multer** - Multipart/form-data handling

### DevOps & Tools
- **Prisma Studio** - Database GUI
- **Concurrently** - Run multiple commands
- **Nodemon** - Auto-restart dev server

---

## 📦 Prerequisites


| Software | Version | Download Link | Required |
|----------|---------|---------------|----------|
| **Node.js** | v18+ | [nodejs.org](https://nodejs.org/) | ✅ |
| **PostgreSQL** | v14+ | [postgresql.org](https://www.postgresql.org/download/) | ✅ |
| **Cloudinary** | Free Account | [cloudinary.com/signup](https://cloudinary.com/users/register/free) | ✅ |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) | Recommended |

---

## 🚀 Quick Start (5 Steps)

### 1️⃣ Clone Repository
```bash
git clone <repository-url>
cd frontend-
```

### 2️⃣ Install Dependencies
```bash
# Install frontend & backend dependencies
npm run setup
```

### 3️⃣ Setup PostgreSQL Database

**Install PostgreSQL** (jika belum):
- 📖 **Windows Guide**: Lihat `INSTALL_POSTGRESQL_WINDOWS.md`
- 🍎 **macOS**: `brew install postgresql@18`
- 🐧 **Linux**: `sudo apt install postgresql`

**Create Database:**
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE unklab_ecommerce;

# Verify
\l

# Exit
\q
```

### 4️⃣ Setup Cloudinary & Environment Variables

**A. Get Cloudinary Credentials:**
1. Sign up: https://cloudinary.com/users/register/free
2. Login → Dashboard
3. Copy: **Cloud Name**, **API Key**, **API Secret**

**B. Create `.env` file di folder `backend/`:**

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/unklab_ecommerce?schema=public"

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=unklab_ecommerce_secret_key_2024_very_secure
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Cloudinary Configuration (PENTING!)
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**⚠️ IMPORTANT:** 
- Ganti `YOUR_PASSWORD` dengan password PostgreSQL Anda
- Ganti semua `CLOUDINARY_*` dengan credentials dari dashboard Cloudinary
- **JANGAN commit file `.env` ke Git!** (sudah ada di `.gitignore`)

### 5️⃣ Setup Database & Run Application

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations (create tables)
npx prisma migrate dev --name init

# Seed database dengan data dummy
npm run seed

# Kembali ke root folder
cd ..

# Run frontend + backend bersamaan
npm run dev:all
```

**🎉 Done!** Aplikasi akan berjalan di:
- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:3001
- 📊 **API Health Check**: http://localhost:3001/api/health

---

## 🔐 Default Login Credentials

### Admin Account
```
Email: admin@unklab.ac.id
Password: admin123
```
**Akses:**
- Admin Dashboard
- Product Management
- Order Management
- User Management

### User Account
```
Email: john@student.unklab.ac.id
Password: password123
```
**Akses:**
- Browse & Shop
- Cart & Checkout
- Order History
- Wishlist

---

## 📁 Project Structure

```
frontend-/
├── src/                        # Frontend source code
│   ├── components/            # React components (Navbar, Footer, etc)
│   ├── pages/                # Page components (Home, Shop, Admin, etc)
│   │   ├── admin/           # Admin pages (Products, Orders, etc)
│   │   ├── Login.jsx        # Login page
│   │   └── Register.jsx     # Register page
│   ├── context/              # React Context (Auth, Cart, Wishlist)
│   ├── services/             # API services (Axios)
│   └── config/               # Configuration files
├── backend/                   # Backend source code
│   ├── controllers/          # Request handlers (business logic)
│   ├── routes/              # API route definitions
│   ├── middleware/          # Custom middleware (auth, error handler)
│   ├── config/              # Backend config (Cloudinary, Multer)
│   ├── utils/               # Utility functions (Prisma client, JWT)
│   ├── prisma/              # Prisma schema & migrations
│   │   ├── schema.prisma   # Database schema definition
│   │   └── seed.js         # Database seeder
│   └── uploads/             # Temporary uploads (gitignored)
├── public/                   # Static assets
├── .gitignore               # Git ignore rules
├── package.json             # Root package.json (scripts)
├── README.md                # This file
├── QUICK_START.md           # Quick start guide
└── INSTALL_POSTGRESQL_WINDOWS.md  # PostgreSQL installation guide
```

---

## 🔄 API Endpoints

### 🔓 Public Endpoints

#### Products
```
GET    /api/products              # Get all products (with filters)
GET    /api/products/:id          # Get product by ID
GET    /api/products/:id/similar  # Get similar products
```

#### Categories
```
GET    /api/categories            # Get all categories
GET    /api/categories/:id        # Get category by ID
GET    /api/categories/slug/:slug # Get category by slug
```

#### Authentication
```
POST   /api/auth/register         # Register new user
POST   /api/auth/login           # Login user
```

### 🔒 Protected Endpoints (Requires Authentication)

#### Auth
```
GET    /api/auth/me              # Get current user
PUT    /api/auth/profile         # Update profile
PUT    /api/auth/change-password # Change password
```

#### Cart
```
GET    /api/cart                 # Get user's cart
POST   /api/cart                 # Add item to cart
PUT    /api/cart/:id             # Update cart item
DELETE /api/cart/:id             # Remove from cart
DELETE /api/cart                 # Clear cart
```

#### Orders
```
POST   /api/orders               # Create order from cart
GET    /api/orders/my-orders     # Get user's orders
GET    /api/orders/:id           # Get order by ID
GET    /api/orders/number/:orderNumber  # Get order by order number
PUT    /api/orders/:id/cancel    # Cancel order
```

#### Wishlist
```
GET    /api/wishlist             # Get user's wishlist
POST   /api/wishlist             # Add to wishlist
DELETE /api/wishlist/:id         # Remove from wishlist
GET    /api/wishlist/check/:productId  # Check if in wishlist
```

### 👨‍💼 Admin Only Endpoints

#### Products Management
```
POST   /api/products             # Create product (with image upload)
PUT    /api/products/:id         # Update product
DELETE /api/products/:id         # Delete product (+ Cloudinary image)
```

#### Categories Management
```
POST   /api/categories           # Create category
PUT    /api/categories/:id       # Update category
DELETE /api/categories/:id       # Delete category
```

#### Orders Management
```
GET    /api/orders/admin/all     # Get all orders
PUT    /api/orders/admin/:id/status  # Update order status
```

#### Users Management
```
GET    /api/users                # Get all users
GET    /api/users/statistics     # Get user statistics
GET    /api/users/:id            # Get user by ID
PUT    /api/users/:id            # Update user
DELETE /api/users/:id            # Delete user
```

---

## 💾 Database Schema

### Models & Relations

```
User
 ├── orders (1-to-many)
 ├── cartItems (1-to-many)
 └── wishlistItems (1-to-many)

Category
 └── products (1-to-many)

Product
 ├── category (many-to-1)
 ├── cartItems (1-to-many)
 ├── orderItems (1-to-many)
 └── wishlistItems (1-to-many)

Order
 ├── user (many-to-1)
 └── orderItems (1-to-many)

OrderItem
 ├── order (many-to-1)
 └── product (many-to-1)
```

**View Schema:** `backend/prisma/schema.prisma`

---

## 🖼️ Cloudinary Image Management

### Features
- ✅ **Cloud Storage**: Images stored di Cloudinary cloud
- ✅ **Auto Upload**: Images otomatis diupload saat create/update product
- ✅ **Auto Delete**: Images otomatis dihapus dari Cloudinary saat:
  - Delete product
  - Update product dengan gambar baru
- ✅ **Auto Optimization**: Images di-resize & compress otomatis
- ✅ **CDN Delivery**: Fast loading dari Cloudinary CDN worldwide

### Upload Flow
```
Admin Upload Image
    ↓
Multer + CloudinaryStorage
    ↓
Upload to Cloudinary Cloud
    ↓
Get secure_url
    ↓
Save URL to PostgreSQL Database
    ↓
✅ Image accessible via CDN
```

### Configuration
- **Folder**: `unklab-ecommerce/products/`
- **Max Size**: 5MB
- **Formats**: JPG, JPEG, PNG, WEBP
- **Auto Resize**: Max 1000x1000px
- **Quality**: Auto optimization

**📖 Setup Guide**: Lihat `QUICK_START.md` section Cloudinary

---

## 📜 Available Scripts

### Root Directory

```bash
# Development
npm run dev              # Run frontend only (Vite)
npm run frontend         # Alias for npm run dev
npm run backend          # Run backend only (Express + Nodemon)
npm run dev:all          # Run frontend + backend concurrently

# Setup
npm run setup            # Install all dependencies (root + backend)
npm run backend:install  # Install backend dependencies only

# Build
npm run build            # Build frontend for production
npm run preview          # Preview production build
```

### Backend Directory

```bash
cd backend

# Development
npm run dev              # Run backend dengan nodemon (auto-reload)
npm start                # Run backend production mode

# Prisma
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (Database GUI)

# Database
npm run seed             # Seed database dengan data dummy
```

---

## 🧪 Testing & Development Tools

### Prisma Studio (Database GUI)
```bash
cd backend
npm run prisma:studio
```
Opens http://localhost:5555 - Visual database editor

### API Testing
- **Postman**: Import API collection
- **Thunder Client**: VS Code extension
- **curl**: Command line testing

Example:
```bash
# Health check
curl http://localhost:3001/api/health

# Get products
curl http://localhost:3001/api/products

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@unklab.ac.id","password":"admin123"}'
```

---

## 🐛 Troubleshooting

### "Can't reach database server"

**Cause:** PostgreSQL tidak running atau credentials salah

**Fix:**
```bash
# Windows: Check service
services.msc → postgresql-x64-18 → Start

# macOS
brew services start postgresql@18

# Linux
sudo systemctl start postgresql

# Test connection
psql -U postgres -d unklab_ecommerce
```

### "Prisma Client not found"

**Fix:**
```bash
cd backend
npx prisma generate
```

### "Invalid Cloudinary credentials"

**Fix:**
1. Verify credentials di Cloudinary Dashboard
2. Update `backend/.env` dengan credentials yang benar
3. Restart backend server
4. Test upload image

### "Port 3001 already in use"

**Fix:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3001 | xargs kill -9
```

### Database Schema Mismatch

**Fix:**
```bash
cd backend
npx prisma migrate reset  # ⚠️ Deletes all data
npm run seed             # Re-seed database
```

### Images Not Uploading to Cloudinary

**Checklist:**
- [ ] Cloudinary credentials benar di `.env`
- [ ] Backend server sudah restart setelah update `.env`
- [ ] File size < 5MB
- [ ] File format: JPG/PNG/WEBP
- [ ] Check backend logs untuk error messages

---

## 🎨 Design System

### Colors
```css
/* Primary */
--unklab-blue: #1e40af;

/* Secondary */
--unklab-gold: #eab308;

/* Background */
--bg-light: #f8fafc;

/* Text */
--text-dark: #1e293b;
```

### Typography
- **Font Family**: Inter, system-ui
- **Headings**: Bold, 2xl-4xl
- **Body**: Regular, base

---

## 🔒 Security Features

- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Password Hashing**: bcryptjs with salt rounds
- ✅ **Protected Routes**: Middleware validation
- ✅ **Role-Based Access**: Admin-only endpoints
- ✅ **CORS Configuration**: Allowed origins only
- ✅ **SQL Injection Protection**: Prisma ORM parameterized queries
- ✅ **Environment Variables**: Sensitive data not committed
- ✅ **Auto Logout**: Token expiry handling

---

## 📊 Performance Optimizations

- ⚡ **Vite Build Tool**: Lightning-fast dev server & builds
- ⚡ **Cloudinary CDN**: Fast image delivery worldwide
- ⚡ **Database Indexing**: Optimized queries
- ⚡ **Lazy Loading**: Code splitting dengan React Router
- ⚡ **Image Optimization**: Auto resize & compress
- ⚡ **API Caching**: Axios response caching

---

## 📚 Additional Documentation

- 📖 **Quick Start**: `QUICK_START.md` - Panduan cepat 5 langkah
- 🗄️ **PostgreSQL Installation**: `INSTALL_POSTGRESQL_WINDOWS.md`
- 🔧 **API Documentation**: Lihat section API Endpoints di atas
- 🎨 **Component Guide**: Check `src/components/` untuk examples

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Team & Credits

Platform ini dikembangkan untuk **Universitas Klabat (UNKLAB)** sebagai solusi e-commerce kampus.

### Technologies Used
- React Team - React Library
- Vercel - Vite Build Tool
- Tailwind Labs - Tailwind CSS
- Prisma - Database ORM
- Cloudinary - Image Management

---

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Check **Troubleshooting** section di atas
2. Review documentation files
3. Check existing GitHub Issues
4. Create new Issue dengan template

---

## 🎯 Roadmap

### Current Version: 1.0.0
- ✅ Full CRUD functionality
- ✅ Authentication & Authorization
- ✅ Cloudinary Integration
- ✅ Order Management

### Future Enhancements
- [ ] Email notifications (order confirmation)
- [ ] Payment gateway integration (Midtrans/Xendit)
- [ ] Product reviews & ratings
- [ ] Advanced analytics dashboard
- [ ] Export reports (PDF/Excel)
- [ ] Real-time stock notifications
- [ ] Multi-language support

---

<div align="center">

**Dibuat dengan ❤️ untuk UNKLAB Community**

[⬆ Back to Top](#-unklab-campus-e-commerce-platform)

</div>
