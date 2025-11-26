import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Data untuk seeding database
const seedData = {
  categories: [
    { name: 'Apparel', description: 'Pakaian dan fashion Starg', icon: '👕' },
    { name: 'Accessories', description: 'Aksesori dan merchandise', icon: '🎒' },
    { name: 'Stationery', description: 'Alat tulis dan keperluan kuliah', icon: '📚' },
    { name: 'Food & Beverage', description: 'Makanan dan minuman lokal', icon: '☕' },
  ],
  users: [
    {
      name: 'Admin Starg',
      email: 'admin@starg.com',
      password: 'admin123',
      role: 'admin',
      phone: '081234567890',
      address: 'Universitas Klabat, Airmadidi',
    },
    {
      name: 'John Doe',
      email: 'john@starg.com',
      password: 'password123',
      role: 'user',
      phone: '081298765432',
      address: 'Tomohon',
    },
  ],
  products: [
    {
      name: 'Starg Hoodie Premium Navy',
      description: 'Hoodie eksklusif dengan logo Starg, bahan cotton fleece premium, nyaman dan hangat.',
      price: 250000,
      category: 'Apparel',
      faculty: 'UKM Kreatif',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      stock: 50,
      rating: 4.8,
      reviews: 24,
    },
    {
      name: 'Notebook Kulit Starg Edition',
      description: 'Buku catatan dengan cover kulit sintetis premium, logo Starg embossed, 200 halaman.',
      price: 120000,
      category: 'Stationery',
      faculty: 'UKM Entrepreneur',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
      stock: 75,
      rating: 4.9,
      reviews: 18,
    },
    {
      name: 'Kopi Arabica Tomohon Blend',
      description: 'Kopi pilihan dari petani lokal Tomohon, roasted fresh, kemasan 200gr.',
      price: 65000,
      category: 'Food & Beverage',
      faculty: 'Fakultas Ekonomi',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800',
      stock: 120,
      rating: 4.7,
      reviews: 67,
    },
    {
      name: 'Starg T-Shirt Classic White',
      description: 'Kaos katun combed 30s dengan sablon plastisol berkualitas, desain minimalis Starg.',
      price: 95000,
      category: 'Apparel',
      faculty: 'UKM Kreatif',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      stock: 150,
      rating: 4.5,
      reviews: 89,
    },
    {
      name: 'Sticker Pack Starg',
      description: 'Set 10 sticker vinyl waterproof dengan berbagai desain Starg yang aesthetic.',
      price: 35000,
      category: 'Accessories',
      faculty: 'Fakultas Seni',
      image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800',
      stock: 200,
      rating: 4.4,
      reviews: 102,
    },
    {
      name: 'Tumbler Stainless Starg 500ml',
      description: 'Tumbler stainless steel dengan insulasi ganda, menjaga suhu minuman hingga 12 jam.',
      price: 145000,
      category: 'Accessories',
      faculty: 'UKM Entrepreneur',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
      stock: 60,
      rating: 4.8,
      reviews: 34,
    },
    {
      name: 'Madu Hutan Minahasa 350ml',
      description: 'Madu murni dari hutan Minahasa, tanpa campuran, kaya manfaat kesehatan.',
      price: 85000,
      category: 'Food & Beverage',
      faculty: 'Fakultas Pertanian',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784046?w=800',
      stock: 45,
      rating: 4.9,
      reviews: 28,
    },
    {
      name: 'Pin Enamel Starg Collection',
      description: 'Set 3 pin enamel dengan desain eksklusif Starg, cocok untuk koleksi atau gift.',
      price: 45000,
      category: 'Accessories',
      faculty: 'Fakultas Seni',
      image: 'https://images.unsplash.com/photo-1610652492500-ded49c4e18d9?w=800',
      stock: 80,
      rating: 4.6,
      reviews: 51,
    },
    {
      name: 'Keripik Pisang Sulut Premium',
      description: 'Keripik pisang renyah dari pisang lokal Sulawesi Utara, varian original dan coklat.',
      price: 25000,
      category: 'Food & Beverage',
      faculty: 'UKM Kuliner',
      image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800',
      stock: 180,
      rating: 4.5,
      reviews: 95,
    },
    {
      name: 'Sweater Starg Grey Premium',
      description: 'Sweater abu-abu dengan bordiran Starg, bahan katun fleece lembut dan hangat.',
      price: 220000,
      category: 'Apparel',
      faculty: 'UKM Kreatif',
      image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
      stock: 40,
      rating: 4.7,
      reviews: 19,
    },
    {
      name: 'Gantungan Kunci Starg Leather',
      description: 'Gantungan kunci kulit asli dengan logo Starg embossed, elegan dan tahan lama.',
      price: 55000,
      category: 'Accessories',
      faculty: 'UKM Entrepreneur',
      image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800',
      stock: 95,
      rating: 4.6,
      reviews: 42,
    },
  ],
};

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Seed Categories
  console.log('📁 Seeding categories...');
  const categoryMap = {};
  for (const cat of seedData.categories) {
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
        description: cat.description,
        icon: cat.icon,
      },
    });
    categoryMap[cat.name] = category.id;
    console.log(`  ✅ Created category: ${category.name}`);
  }

  // Seed Users (with hashed passwords)
  console.log('👤 Seeding users...');
  for (const user of seedData.users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const createdUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
    console.log(`  ✅ Created user: ${createdUser.email} (${createdUser.role})`);
  }

  // Seed Products
  console.log('📦 Seeding products...');
  for (const product of seedData.products) {
    const categoryId = categoryMap[product.category];
    if (!categoryId) {
      console.log(`  ⚠️  Skipping product ${product.name} - category not found`);
      continue;
    }

    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: product.image,
        categoryId: categoryId,
        faculty: product.faculty,
        rating: product.rating || 0,
        sold: product.reviews || 0,
      },
    });
    console.log(`  ✅ Created product: ${product.name}`);
  }

  console.log('');
  console.log('✨ Database seeding completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`  - Users: ${await prisma.user.count()}`);
  console.log(`  - Categories: ${await prisma.category.count()}`);
  console.log(`  - Products: ${await prisma.product.count()}`);
  console.log('');
  console.log('🔐 Login Credentials:');
  console.log('  Admin: admin@starg.com / admin123');
  console.log('  User:  john@starg.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
