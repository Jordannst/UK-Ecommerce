# 🚀 Cara Menjalankan Aplikasi

## 📋 Checklist Sebelum Start

Sebelum menjalankan aplikasi, pastikan:
- [ ] PostgreSQL sudah berjalan (database service aktif)
- [ ] File `backend/.env` sudah dikonfigurasi dengan benar
- [ ] Database `unklab_ecommerce` sudah dibuat
- [ ] Semua dependencies sudah terinstall (`npm run setup`)

---

## 🔄 Setup Awal (Hanya Sekali)

Jika ini pertama kali setup atau database masih kosong:

### 1. Setup Database (Hanya Sekali)
```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations (buat tabel di database)
npx prisma migrate dev --name init

# Seed database (isi data awal)
npm run seed

# Kembali ke root
cd ..
```

**Output yang diharapkan:**
```
✅ Database seeding completed successfully!
📊 Summary:
  - Users: 2
  - Categories: 4
  - Products: 12
```

---

## ▶️ Menjalankan Aplikasi

### Opsi 1: Jalankan Frontend + Backend Bersamaan (Recommended)

```bash
# Dari root directory (C:\Games\frontend-\)
npm run dev:all
```

**Output yang diharapkan:**
```
[BACKEND] 🚀 BACKEND SERVER STARTED
[BACKEND] 📍 URL: http://localhost:3001
[BACKEND] 📦 Database: ✅ Connected
[FRONTEND] Local: http://localhost:3000
```

**Akses:**
- 🌐 Frontend: http://localhost:3000
- 🔧 Backend API: http://localhost:3001
- 📊 Health Check: http://localhost:3001/api/health

---

### Opsi 2: Jika Ada Masalah Port

Jika port 3000 atau 3001 sudah dipakai:

```bash
# Bebaskan port terlebih dahulu
npm run dev:all:safe
```

Script ini akan:
1. Kill proses yang memakai port 3000 dan 3001
2. Tunggu 2 detik
3. Start frontend dan backend

---

### Opsi 3: Jalankan Terpisah (Tidak Recommended)

**Terminal 1 - Backend:**
```bash
npm run backend
```

**Terminal 2 - Frontend:**
```bash
npm run frontend
```

⚠️ **Tidak recommended** karena lebih mudah terjadi konflik port.

---

## 🔐 Login Credentials (Setelah Seed)

### Admin Account
```
Email: admin@unklab.ac.id
Password: admin123
```

### User Account
```
Email: john@student.unklab.ac.id
Password: password123
```

---

## 📝 Urutan yang Benar

### Untuk Development Harian:
```bash
# Langkah 1: Start aplikasi
npm run dev:all
```

**Catatan:**
- `npm run seed` **TIDAK perlu** dijalankan setiap kali
- Seed hanya untuk setup awal atau reset data
- `npm run dev:all` sudah cukup untuk development

---

### Untuk Setup Baru / Reset Database:
```bash
# 1. Setup database (hanya sekali)
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run seed
cd ..

# 2. Start aplikasi
npm run dev:all
```

---

## ❌ Troubleshooting

### Error: "Port 3001 already in use"
**Solusi:**
```bash
# Gunakan safe mode yang akan kill port otomatis
npm run dev:all:safe
```

### Error: "Cannot connect to database"
**Solusi:**
1. Pastikan PostgreSQL berjalan
2. Cek `DATABASE_URL` di `backend/.env`
3. Pastikan database `unklab_ecommerce` sudah dibuat

### Error: 404 pada `/api/auth/register`
**Solusi:**
- Backend tidak berjalan
- Pastikan terminal menunjukkan `[BACKEND] 🚀 BACKEND SERVER STARTED`
- Cek `http://localhost:3001/api/health` harus return JSON

---

## 💡 Tips

1. **Selalu gunakan `npm run dev:all`** - lebih praktis dan aman
2. **Jangan run seed berulang kali** - hanya saat setup awal atau reset
3. **Cek terminal output** - pastikan backend dan frontend start dengan benar
4. **Jika ada error, cek TROUBLESHOOTING.md** untuk panduan lengkap

---

## 📚 Command Summary

| Command | Kapan Digunakan |
|---------|----------------|
| `npm run dev:all` | **Setiap kali development** |
| `npm run seed` | Hanya saat setup awal atau reset data |
| `npm run dev:all:safe` | Jika port sudah dipakai |
| `npm run backend` | Hanya backend (jarang digunakan) |
| `npm run frontend` | Hanya frontend (jarang digunakan) |

---

## ✅ Quick Start (Setiap Hari)

```bash
# 1. Buka terminal di folder: C:\Games\frontend-\

# 2. Start aplikasi
npm run dev:all

# 3. Buka browser → http://localhost:3000

# 4. Login dengan:
#    Email: admin@unklab.ac.id
#    Password: admin123
```

**Selesai!** 🎉

