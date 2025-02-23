import { PrismaClient } from '@prisma/client';
import { products } from '../mocks/index';

const prisma = new PrismaClient();

const seedProducts = async () => {
  console.log('🛍️ Sembrando productos...');

  for (const product of products) {
    const { categories: categoryNames, ...productData } = product;

    // Buscar IDs de categorías
    const categoryIds = await Promise.all(
      categoryNames.map(async (name) => {
        const category = await prisma.category.findFirst({
          where: { name },
        });
        return category?.id;
      }),
    );

    // Crear producto con sus categorías
    await prisma.product.create({
      data: {
        ...productData,
        categories: {
          create: categoryIds.map((categoryId) => ({
            categoryId: categoryId!,
          })),
        },
      },
    });
  }
  console.log('✅ Productos sembrados');
};

export default seedProducts;
