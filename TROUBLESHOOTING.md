# 🔧 Troubleshooting Guide

Panduan lengkap untuk mengatasi masalah umum yang mungkin terjadi saat setup dan menjalankan aplikasi Starg E-Commerce.

---

## 📋 Daftar Isi

1. [Database Connection Issues](#database-connection-issues)
2. [Port Conflicts](#port-conflicts)
3. [API Endpoint Errors](#api-endpoint-errors)
4. [Prisma Errors](#prisma-errors)
5. [Cloudinary Issues](#cloudinary-issues)
6. [Environment Variables](#environment-variables)
7. [Dependencies Issues](#dependencies-issues)
8. [Build & Production Issues](#build--production-issues)

---

## 🗄️ Database Connection Issues

### ❌ Error: "Can't reach database server" atau "Connection refused"

**Penyebab:**
- PostgreSQL service tidak berjalan
- Database belum dibuat
- Credentials salah di `.env`
- Port PostgreSQL tidak sesuai

**Solusi:**

#### Windows:
```bash
# 1. Cek apakah PostgreSQL service berjalan
# Buka Services (services.msc) atau PowerShell:
Get-Service -Name postgresql*

# 2. Start service jika tidak berjalan
# Via Services GUI: Cari "postgresql-x64-XX" → Right click → Start
# Atau via PowerShell (sebagai Administrator):
Start-Service postgresql-x64-18

# 3. Test koneksi
psql -U postgres -d starg_ecommerce
```

#### macOS:
```bash
# Start PostgreSQL service
brew services start postgresql@18

# Atau jika menggunakan PostgreSQL.app
# Buka aplikasi PostgreSQL dan klik Start

# Test koneksi
psql -U postgres -d starg_ecommerce
```

#### Linux:
```bash
# Start PostgreSQL service
sudo systemctl start postgresql

# Atau
sudo service postgresql start

# Test koneksi
psql -U postgres -d starg_ecommerce
```

**Verifikasi Database:**
```sql
-- Login ke PostgreSQL
psql -U postgres

-- Cek apakah database sudah ada
\l

-- Jika belum ada, buat database
CREATE DATABASE starg_ecommerce;

-- Exit
\q
```

**Cek File `.env`:**
```env
# Pastikan format DATABASE_URL benar
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/starg_ecommerce?schema=public"
```

**Tips:**
- Ganti `YOUR_PASSWORD` dengan password PostgreSQL Anda
- Pastikan port adalah `5432` (default PostgreSQL)
- Jika menggunakan port berbeda, sesuaikan di `DATABASE_URL`

---

### ❌ Error: "password authentication failed"

**Penyebab:**
- Password PostgreSQL salah
- User tidak memiliki akses ke database

**Solusi:**
```bash
# 1. Reset password PostgreSQL (Windows)
# Buka Command Prompt sebagai Administrator
net user postgres NEW_PASSWORD

# 2. Atau ubah password via psql
psql -U postgres
ALTER USER postgres WITH PASSWORD 'new_password';

# 3. Update .env dengan password baru
DATABASE_URL="postgresql://postgres:new_password@localhost:5432/starg_ecommerce?schema=public"
```

---

### ❌ Error: "database does not exist"

**Solusi:**
```sql
-- Login ke PostgreSQL
psql -U postgres

-- Buat database
CREATE DATABASE starg_ecommerce;

-- Verifikasi
\l

-- Exit
\q
```

---

## 🔌 Port Conflicts

### ❌ Error: "Port 3001 already in use" atau "Port 3000 already in use"

**Quick Fix (Recommended):**
```bash
# Gunakan script safe yang akan otomatis kill port
npm run dev:all:safe
```

**Manual Fix - Windows:**
```powershell
# 1. Cari proses yang menggunakan port 3001
netstat -ano | findstr :3001

# Output akan menunjukkan PID, contoh:
# TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING    12345

# 2. Kill proses dengan PID tersebut
taskkill /PID 12345 /F

# Untuk port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Manual Fix - macOS/Linux:**
```bash
# 1. Cari proses yang menggunakan port 3001
lsof -ti:3001

# 2. Kill proses
lsof -ti:3001 | xargs kill -9

# Untuk port 3000
lsof -ti:3000 | xargs kill -9
```

**Prevention:**
- Selalu gunakan `npm run dev:all:safe` untuk menghindari konflik port
- Tutup aplikasi yang mungkin menggunakan port tersebut (browser, IDE, dll)

---

## 🌐 API Endpoint Errors

### ❌ Error 404 pada `/api/auth/register` atau `/api/auth/login`

**Penyebab:**
- Backend server tidak berjalan
- Port backend salah
- CORS configuration salah

**Solusi:**

1. **Cek apakah backend berjalan:**
```bash
# Terminal harus menunjukkan:
[BACKEND] 🚀 BACKEND SERVER STARTED
[BACKEND] 📍 URL: http://localhost:3001
[BACKEND] 📦 Database: ✅ Connected
```

2. **Test health endpoint:**
```bash
# Buka browser atau gunakan curl
curl http://localhost:3001/api/health

# Harus return JSON:
# {"status":"ok","message":"API is running"}
```

3. **Jika return HTML (404 page):**
   - Port 3001 masih dipakai frontend
   - Gunakan `npm run dev:all:safe` untuk membebaskan port

4. **Cek CORS configuration:**
```env
# Di backend/.env
FRONTEND_URL=http://localhost:3000
```

---

### ❌ Error: "Network Error" atau "CORS Error"

**Penyebab:**
- Backend tidak berjalan
- CORS configuration salah
- Frontend URL tidak sesuai

**Solusi:**

1. **Pastikan backend berjalan di port 3001**
2. **Cek `FRONTEND_URL` di `backend/.env`:**
```env
FRONTEND_URL=http://localhost:3000
```

3. **Restart backend setelah mengubah `.env`**

---

### ❌ Error 401: "Unauthorized" atau "Invalid token"

**Penyebab:**
- Token JWT expired
- Token tidak valid
- User belum login

**Solusi:**
1. Logout dan login kembali
2. Cek apakah token masih valid di browser localStorage
3. Pastikan `JWT_SECRET` di `.env` tidak berubah

---

## 🔧 Prisma Errors

### ❌ Error: "Prisma Client not found" atau "Cannot find module '@prisma/client'"

**Solusi:**
```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Install dependencies jika perlu
npm install
```

---

### ❌ Error: "Database schema is not in sync"

**Solusi:**
```bash
cd backend

# 1. Reset database (⚠️ Hapus semua data)
npx prisma migrate reset

# 2. Run migrations
npx prisma migrate dev --name init

# 3. Seed database
npm run seed
```

**Atau jika tidak ingin kehilangan data:**
```bash
cd backend

# 1. Generate Prisma Client
npx prisma generate

# 2. Create migration untuk sync schema
npx prisma migrate dev --name sync_schema
```

---

### ❌ Error: "Migration failed" atau "Migration already applied"

**Solusi:**
```bash
cd backend

# 1. Cek status migration
npx prisma migrate status

# 2. Jika ada masalah, reset migration
npx prisma migrate reset

# 3. Run migration ulang
npx prisma migrate dev --name init
```

---

## ☁️ Cloudinary Issues

### ❌ Error: "Invalid Cloudinary credentials"

**Penyebab:**
- Credentials salah atau belum diisi
- Environment variables tidak terbaca

**Solusi:**

1. **Verifikasi credentials di Cloudinary Dashboard:**
   - Login ke https://cloudinary.com/console
   - Dashboard → Account Details
   - Copy: **Cloud Name**, **API Key**, **API Secret**

2. **Update `backend/.env`:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

3. **Restart backend server** setelah mengubah `.env`

4. **Test upload:**
   - Login sebagai admin
   - Coba upload gambar produk
   - Cek console backend untuk error messages

---

### ❌ Error: "Image upload failed" atau "File too large"

**Penyebab:**
- File size > 5MB
- Format file tidak didukung
- Network issue

**Solusi:**

1. **Cek file size:**
   - Maksimal 5MB per file
   - Gunakan image compressor jika perlu

2. **Cek format file:**
   - Format yang didukung: JPG, JPEG, PNG, WEBP
   - Convert ke format yang didukung jika perlu

3. **Cek network connection:**
   - Pastikan internet terhubung
   - Cek firewall settings

---

### ❌ Error: "Images not displaying"

**Penyebab:**
- URL image tidak valid
- Cloudinary folder path salah
- CORS issue

**Solusi:**

1. **Cek URL image di database:**
```sql
-- Via Prisma Studio
cd backend
npm run prisma:studio

-- Atau via psql
psql -U postgres -d starg_ecommerce
SELECT id, name, image_url FROM "Product" LIMIT 5;
```

2. **Verifikasi Cloudinary configuration:**
   - Pastikan folder path: `starg-ecommerce/products/`
   - Cek di Cloudinary Dashboard → Media Library

---

## 🔐 Environment Variables

### ❌ Error: "DATABASE_URL is not defined"

**Solusi:**

1. **Pastikan file `.env` ada di folder `backend/`:**
```bash
# Cek apakah file ada
ls backend/.env  # macOS/Linux
dir backend\.env  # Windows
```

2. **Buat file `.env` jika belum ada:**
```bash
cd backend
cp .env.example .env  # Jika ada .env.example
# Atau buat manual
```

3. **Isi dengan konfigurasi yang benar:**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/starg_ecommerce?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET=starg_ecommerce_secret_key_2024_very_secure
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

4. **Restart backend server** setelah membuat/mengubah `.env`

---

### ❌ Error: "JWT_SECRET is not defined"

**Solusi:**
```env
# Tambahkan di backend/.env
JWT_SECRET=starg_ecommerce_secret_key_2024_very_secure
JWT_EXPIRES_IN=7d
```

**⚠️ Penting:**
- Jangan commit file `.env` ke Git
- Gunakan secret key yang kuat untuk production
- Jangan share `.env` file

---

## 📦 Dependencies Issues

### ❌ Error: "Cannot find module" atau "Module not found"

**Solusi:**
```bash
# 1. Hapus node_modules dan package-lock.json
rm -rf node_modules package-lock.json  # macOS/Linux
rmdir /s node_modules & del package-lock.json  # Windows

# 2. Install ulang dependencies
npm install

# 3. Untuk backend
cd backend
rm -rf node_modules package-lock.json
npm install
cd ..

# 4. Install root dependencies
npm install
```

---

### ❌ Error: "npm ERR! code ELIFECYCLE"

**Solusi:**
```bash
# 1. Clear npm cache
npm cache clean --force

# 2. Hapus node_modules
rm -rf node_modules  # macOS/Linux
rmdir /s node_modules  # Windows

# 3. Install ulang
npm install
```

---

### ❌ Error: "Peer dependency warnings"

**Catatan:**
- Peer dependency warnings biasanya tidak fatal
- Aplikasi masih bisa berjalan
- Jika ada error runtime, update dependencies:
```bash
npm update
```

---

## 🏗️ Build & Production Issues

### ❌ Error: "Build failed" atau "Vite build error"

**Solusi:**
```bash
# 1. Clear build cache
rm -rf dist .vite  # macOS/Linux
rmdir /s dist .vite  # Windows

# 2. Rebuild
npm run build

# 3. Jika masih error, cek:
# - Syntax errors di code
# - Missing imports
# - Environment variables
```

---

### ❌ Error: "Production build not working"

**Solusi:**

1. **Cek environment variables untuk production:**
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
FRONTEND_URL=your_production_frontend_url
```

2. **Build frontend:**
```bash
npm run build
```

3. **Test production build:**
```bash
npm run preview
```

---

## 🔍 General Debugging Tips

### 1. Check Logs
```bash
# Backend logs
# Cek terminal output saat menjalankan npm run dev:all

# Frontend logs
# Buka browser DevTools (F12) → Console tab
```

### 2. Verify Services
```bash
# PostgreSQL
psql -U postgres -c "SELECT version();"

# Node.js
node --version  # Harus v18+

# npm
npm --version
```

### 3. Clear All Caches
```bash
# npm cache
npm cache clean --force

# Vite cache
rm -rf .vite node_modules/.vite

# Prisma cache
cd backend
rm -rf node_modules/.prisma
npx prisma generate
```

### 4. Fresh Start
```bash
# 1. Stop semua proses
# 2. Hapus node_modules
rm -rf node_modules backend/node_modules

# 3. Install ulang
npm run setup

# 4. Setup database
cd backend
npx prisma generate
npx prisma migrate reset
npm run seed
cd ..

# 5. Start aplikasi
npm run dev:all
```

---

## 📞 Still Having Issues?

Jika masalah masih belum teratasi:

1. **Cek dokumentasi:**
   - 📖 `README.md` - Overview dan quick start
   - 📖 `CARA_RUN.md` - Panduan lengkap cara menjalankan
   - 🗄️ `INSTALL_POSTGRESQL_WINDOWS.md` - Setup PostgreSQL

2. **Cek error messages:**
   - Baca error message dengan teliti
   - Cari error message di Google/Stack Overflow
   - Cek GitHub Issues (jika ada)

3. **Verifikasi setup:**
   - Pastikan semua prerequisites terinstall
   - Pastikan semua environment variables sudah benar
   - Pastikan database sudah dibuat dan berjalan

4. **Create Issue:**
   - Sertakan error message lengkap
   - Sertakan steps untuk reproduce
   - Sertakan environment info (OS, Node version, dll)

---

## ✅ Quick Checklist

Sebelum meminta bantuan, pastikan:

- [ ] PostgreSQL service berjalan
- [ ] Database `starg_ecommerce` sudah dibuat
- [ ] File `backend/.env` sudah dikonfigurasi dengan benar
- [ ] Semua dependencies sudah terinstall (`npm run setup`)
- [ ] Prisma Client sudah di-generate (`npx prisma generate`)
- [ ] Database sudah di-migrate (`npx prisma migrate dev`)
- [ ] Database sudah di-seed (`npm run seed`)
- [ ] Backend server berjalan di port 3001
- [ ] Frontend server berjalan di port 3000
- [ ] Tidak ada port conflicts
- [ ] Cloudinary credentials sudah benar (jika menggunakan upload image)

---

<div align="center">

**Masalah masih belum teratasi?** → Baca `README.md` atau `CARA_RUN.md` untuk panduan lengkap.

</div>

