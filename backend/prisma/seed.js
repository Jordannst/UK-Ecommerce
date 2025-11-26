import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('🌱 Starting database seed...');

  // Read db.json
  const dbJsonPath = join(__dirname, '..', '..', 'db.json');
  const dbData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf-8'));

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
  for (const cat of dbData.categories) {
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
        description: cat.description,
        icon: cat.icon
      }
    });
    categoryMap[cat.name] = category.id;
    console.log(`  ✅ Created category: ${category.name}`);
  }

  // Seed Users (with hashed passwords)
  console.log('👤 Seeding users...');
  const users = [];
  for (const user of dbData.users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const createdUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
    users.push(createdUser);
    console.log(`  ✅ Created user: ${createdUser.email} (${createdUser.role})`);
  }

  // Seed Products
  console.log('📦 Seeding products...');
  for (const product of dbData.products) {
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
        ukm: product.ukm || null,
        seller: product.seller || product.faculty,
        rating: product.rating || 0,
        sold: product.reviews || 0,
        createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
      }
    });
    console.log(`  ✅ Created product: ${product.name}`);
  }

  // Seed Orders (if any)
  if (dbData.orders && dbData.orders.length > 0) {
    console.log('🛒 Seeding orders...');
    for (const order of dbData.orders) {
      // Find user
      const user = users.find(u => u.id === order.userId) || users[0];
      
      // Generate order number if not exists
      const orderNumber = order.orderNumber || `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Map status
      let status = 'pending';
      if (order.status === 'Delivered') status = 'completed';
      if (order.status === 'Cancelled') status = 'cancelled';
      if (order.status === 'Processing') status = 'processing';

      // Create order
      const createdOrder = await prisma.order.create({
        data: {
          userId: user.id,
          orderNumber: orderNumber,
          status: status,
          totalAmount: order.total,
          paymentMethod: order.paymentMethod || 'Transfer Bank',
          shippingName: order.customerInfo?.name || user.name,
          shippingPhone: order.customerInfo?.phone || user.phone || '',
          shippingAddress: order.shippingAddress || user.address || '',
          shippingCity: 'Tomohon',
          notes: order.notes,
          createdAt: order.createdAt ? new Date(order.createdAt) : new Date()
        }
      });

      // Create order items
      for (const item of order.items) {
        // Find product by name (since we don't have exact ID mapping)
        const product = await prisma.product.findFirst({
          where: { name: item.name }
        });

        if (product) {
          await prisma.orderItem.create({
            data: {
              orderId: createdOrder.id,
              productId: product.id,
              productName: item.name,
              price: item.price,
              quantity: item.quantity,
              subtotal: item.price * item.quantity
            }
          });
        }
      }

      console.log(`  ✅ Created order: ${orderNumber} (${status})`);
    }
  }

  console.log('✨ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - Users: ${await prisma.user.count()}`);
  console.log(`  - Categories: ${await prisma.category.count()}`);
  console.log(`  - Products: ${await prisma.product.count()}`);
  console.log(`  - Orders: ${await prisma.order.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

