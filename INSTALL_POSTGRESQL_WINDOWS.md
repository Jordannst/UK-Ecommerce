# 🗄️ Panduan Install PostgreSQL di Windows

Panduan lengkap step-by-step untuk menginstall PostgreSQL di Windows untuk kebutuhan development Starg E-Commerce.

---

## 📋 Daftar Isi

1. [Download PostgreSQL](#download-postgresql)
2. [Install PostgreSQL](#install-postgresql)
3. [Setup PostgreSQL](#setup-postgresql)
4. [Verifikasi Installasi](#verifikasi-installasi)
5. [Membuat Database](#membuat-database)
6. [Troubleshooting](#troubleshooting)

---

## 📥 Download PostgreSQL

### Opsi 1: Download dari Website Resmi (Recommended)

1. **Buka browser** dan kunjungi: https://www.postgresql.org/download/windows/
2. **Klik "Download the installer"** → Akan redirect ke https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
3. **Pilih versi:**
   - **PostgreSQL 14** atau lebih tinggi (recommended: **PostgreSQL 18**)
   - **Windows x86-64** (untuk Windows 64-bit)
4. **Klik "Download"** → File installer akan terdownload (ukuran ~200-300 MB)

### Opsi 2: Download via Package Manager

#### Menggunakan Chocolatey:
```powershell
# Install Chocolatey terlebih dahulu (jika belum)
# Buka PowerShell sebagai Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install PostgreSQL
choco install postgresql18
```

#### Menggunakan Scoop:
```powershell
# Install Scoop terlebih dahulu (jika belum)
# Buka PowerShell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install PostgreSQL
scoop install postgresql
```

---

## 💾 Install PostgreSQL

### Step-by-Step Installation

1. **Jalankan installer** yang sudah didownload
   - Double-click file `.exe` (contoh: `postgresql-18.x-windows-x64.exe`)
   - Jika muncul UAC prompt, klik **"Yes"**

2. **Welcome Screen**
   - Klik **"Next"**

3. **Installation Directory**
   - Default: `C:\Program Files\PostgreSQL\18`
   - Biarkan default atau pilih folder lain
   - Klik **"Next"**

4. **Select Components**
   - ✅ **PostgreSQL Server** (wajib)
   - ✅ **pgAdmin 4** (GUI tool, recommended)
   - ✅ **Stack Builder** (optional, untuk tools tambahan)
   - ✅ **Command Line Tools** (wajib)
   - Klik **"Next"**

5. **Data Directory**
   - Default: `C:\Program Files\PostgreSQL\18\data`
   - Biarkan default
   - Klik **"Next"**

6. **Password Setup** ⚠️ **PENTING!**
   - Masukkan **password untuk user `postgres`**
   - **Catat password ini!** (akan digunakan di `DATABASE_URL`)
   - Contoh: `postgres123` atau password yang lebih kuat
   - Klik **"Next"**

7. **Port Configuration**
   - Default: `5432`
   - Biarkan default (kecuali port 5432 sudah dipakai)
   - Klik **"Next"**

8. **Advanced Options**
   - **Locale**: Default (English, United States)
   - Biarkan default
   - Klik **"Next"**

9. **Pre Installation Summary**
   - Review konfigurasi
   - Klik **"Next"**

10. **Installing**
    - Tunggu proses installasi (5-10 menit)
    - Jangan tutup installer

11. **Completing Installation**
    - ✅ **Launch Stack Builder** (optional, bisa di-uncheck)
    - Klik **"Finish"**

---

## ⚙️ Setup PostgreSQL

### 1. Verifikasi Service

PostgreSQL service seharusnya sudah otomatis berjalan setelah installasi.

**Cek via Services:**
1. Tekan `Win + R` → ketik `services.msc` → Enter
2. Cari **"postgresql-x64-18"** (atau versi yang terinstall)
3. Status harus **"Running"**
4. Jika tidak running, **Right click → Start**

**Cek via PowerShell:**
```powershell
# Buka PowerShell
Get-Service -Name postgresql*

# Output harus menunjukkan Status: Running
```

**Start Service (jika tidak running):**
```powershell
# Sebagai Administrator
Start-Service postgresql-x64-18
```

### 2. Setup Environment Variables (Optional)

PostgreSQL biasanya sudah otomatis menambahkan `bin` folder ke PATH, tapi jika command `psql` tidak ditemukan:

1. **Cari lokasi PostgreSQL bin:**
   - Default: `C:\Program Files\PostgreSQL\18\bin`

2. **Tambahkan ke PATH:**
   - Tekan `Win + X` → **System** → **Advanced system settings**
   - Klik **"Environment Variables"**
   - Di **"System variables"**, pilih **"Path"** → **"Edit"**
   - Klik **"New"** → Tambahkan: `C:\Program Files\PostgreSQL\18\bin`
   - Klik **"OK"** di semua dialog
   - **Restart terminal/PowerShell** untuk apply changes

3. **Verifikasi:**
```powershell
# Buka PowerShell baru
psql --version
# Output: psql (PostgreSQL) 18.x
```

---

## ✅ Verifikasi Installasi

### Test Connection

**Via Command Line:**
```powershell
# Buka PowerShell atau Command Prompt
psql -U postgres

# Akan diminta password (masukkan password yang dibuat saat install)
# Jika berhasil, akan masuk ke psql prompt:
# postgres=#
```

**Via pgAdmin 4:**
1. Buka **pgAdmin 4** dari Start Menu
2. Klik **"Add New Server"**
3. **General Tab:**
   - Name: `Local PostgreSQL`
4. **Connection Tab:**
   - Host: `localhost`
   - Port: `5432`
   - Username: `postgres`
   - Password: (masukkan password yang dibuat saat install)
5. Klik **"Save"**
6. Jika berhasil, server akan muncul di sidebar

**Test Query:**
```sql
-- Di psql prompt atau pgAdmin Query Tool
SELECT version();

-- Output akan menunjukkan versi PostgreSQL
```

---

## 🗃️ Membuat Database

### Untuk Starg E-Commerce

**Via Command Line:**
```powershell
# 1. Login ke PostgreSQL
psql -U postgres

# 2. Masukkan password

# 3. Buat database
CREATE DATABASE starg_ecommerce;

# 4. Verifikasi database sudah dibuat
\l

# 5. Exit
\q
```

**Via pgAdmin 4:**
1. Buka **pgAdmin 4**
2. Expand **"Servers"** → **"Local PostgreSQL"** → **"Databases"**
3. **Right click** pada **"Databases"** → **"Create"** → **"Database..."**
4. **General Tab:**
   - Database: `starg_ecommerce`
5. Klik **"Save"**
6. Database akan muncul di sidebar

---

## 🔧 Konfigurasi untuk Aplikasi

### Update `.env` File

Setelah PostgreSQL terinstall dan database dibuat, update file `backend/.env`:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/starg_ecommerce?schema=public"
```

**Ganti:**
- `YOUR_PASSWORD` → Password PostgreSQL yang dibuat saat install
- `starg_ecommerce` → Nama database (jika berbeda)

**Contoh:**
```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/starg_ecommerce?schema=public"
```

---

## 🐛 Troubleshooting

### ❌ Error: "psql is not recognized"

**Solusi:**
1. Tambahkan PostgreSQL bin ke PATH (lihat section Setup Environment Variables)
2. Atau gunakan full path:
```powershell
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

---

### ❌ Error: "password authentication failed"

**Penyebab:**
- Password salah
- User tidak ada

**Solusi:**
```powershell
# Reset password via Windows Services
# 1. Stop PostgreSQL service
Stop-Service postgresql-x64-18

# 2. Edit file pg_hba.conf
# Lokasi: C:\Program Files\PostgreSQL\18\data\pg_hba.conf
# Ubah semua "md5" menjadi "trust" (temporary)

# 3. Start service
Start-Service postgresql-x64-18

# 4. Login tanpa password
psql -U postgres

# 5. Reset password
ALTER USER postgres WITH PASSWORD 'new_password';

# 6. Kembalikan pg_hba.conf ke "md5"
# 7. Restart service
```

---

### ❌ Error: "could not connect to server"

**Penyebab:**
- PostgreSQL service tidak berjalan
- Port salah

**Solusi:**
```powershell
# 1. Cek service status
Get-Service postgresql*

# 2. Start service jika tidak running
Start-Service postgresql-x64-18

# 3. Cek port
netstat -ano | findstr :5432
```

---

### ❌ Error: "port 5432 already in use"

**Penyebab:**
- Port 5432 sudah dipakai aplikasi lain
- Multiple PostgreSQL instances

**Solusi:**
```powershell
# 1. Cek proses yang menggunakan port 5432
netstat -ano | findstr :5432

# 2. Jika ada proses lain, stop atau uninstall
# 3. Atau ubah port PostgreSQL di postgresql.conf
# Lokasi: C:\Program Files\PostgreSQL\18\data\postgresql.conf
# Cari: port = 5432
# Ubah ke: port = 5433
# Restart service
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

## 📚 Useful Commands

### PostgreSQL Commands

```powershell
# Login ke PostgreSQL
psql -U postgres

# Login ke database tertentu
psql -U postgres -d starg_ecommerce

# List semua database
psql -U postgres -c "\l"

# List semua tables
psql -U postgres -d starg_ecommerce -c "\dt"

# Exit psql
\q
```

### Service Management

```powershell
# Start PostgreSQL service
Start-Service postgresql-x64-18

# Stop PostgreSQL service
Stop-Service postgresql-x64-18

# Restart PostgreSQL service
Restart-Service postgresql-x64-18

# Cek status
Get-Service postgresql-x64-18
```

---

## ✅ Checklist Setelah Install

Pastikan semua sudah selesai:

- [ ] PostgreSQL terinstall dengan sukses
- [ ] PostgreSQL service berjalan (Status: Running)
- [ ] Bisa login via `psql -U postgres`
- [ ] Database `starg_ecommerce` sudah dibuat
- [ ] File `backend/.env` sudah dikonfigurasi dengan `DATABASE_URL`
- [ ] Bisa connect dari aplikasi (test dengan `npm run dev:all`)

---

## 🎯 Next Steps

Setelah PostgreSQL terinstall:

1. **Setup Database Schema:**
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

2. **Start Aplikasi:**
```bash
npm run dev:all
```

3. **Verifikasi:**
   - Buka http://localhost:3001/api/health
   - Harus return: `{"status":"ok","message":"API is running"}`

---

## 📖 Referensi

- **PostgreSQL Official Docs**: https://www.postgresql.org/docs/
- **pgAdmin Documentation**: https://www.pgadmin.org/docs/
- **Windows Installation Guide**: https://www.postgresql.org/download/windows/

---

<div align="center">

**Installasi selesai?** → Lanjut ke `CARA_RUN.md` untuk panduan menjalankan aplikasi.

</div>

