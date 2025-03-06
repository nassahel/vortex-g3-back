import { PrismaClient } from '@prisma/client';
import seedUsers from './data/users';
import seedCategories from './data/categories';
import seedProducts from './data/products';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Iniciando seeding...');

    await seedUsers();
    await seedCategories();
    await seedProducts();

    console.log('✅ Seeding completado');
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
