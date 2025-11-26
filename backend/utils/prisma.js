import { PrismaClient } from '@prisma/client';

// Check if DATABASE_URL is configured
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL tidak dikonfigurasi!');
  console.error('📝 Silakan buat file .env di folder backend/ dengan konfigurasi berikut:');
  console.error('');
  console.error('DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/starg_ecommerce?schema=public"');
  console.error('');
  console.error('Lihat file .env.example untuk contoh lengkap.');
  process.exit(1);
}

// Singleton Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Test database connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('1. Pastikan PostgreSQL sudah berjalan');
    console.error('2. Pastikan DATABASE_URL di .env sudah benar');
    console.error('3. Pastikan database "starg_ecommerce" sudah dibuat');
    console.error('4. Pastikan username dan password PostgreSQL benar');
    console.error('');
    console.error('📖 Lihat README.md untuk panduan setup database');
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;

