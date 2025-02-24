import { PrismaClient } from '@prisma/client';
import { products } from '../mocks/index';

const prisma = new PrismaClient();

const seedProducts = async () => {
  console.log('🛍️ Sembrando productos...');

  for (const product of products) {
    const { categories: categoryNames, ...productData } = product;

    // Buscar IDs de categorías
    const categoryIds = await prisma.category.findMany({
      where: { name: { in: categoryNames } },
      select: { id: true },
    });

    // Crear producto con sus categorías
    await prisma.product.create({
      data: {
        ...productData,
        categories: {
          create: categoryIds.map((categoryId) => ({
            categoryId: categoryId.id,
          })),
        },
      },
    });
  }
  console.log('✅ Productos sembrados');
};

export default seedProducts;
