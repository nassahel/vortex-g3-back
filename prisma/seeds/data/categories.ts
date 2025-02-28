import { PrismaClient } from '@prisma/client';
import { categories } from '../mocks/index';

const prisma = new PrismaClient();

const seedCategories = async () => {
  console.log('📑 Sembrando categorías...');

  await prisma.category.createMany({
    data: categories,
  });
  console.log('✅ Categorías sembradas');
};

export default seedCategories;
