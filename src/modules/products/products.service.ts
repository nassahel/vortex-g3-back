import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FilterProductDto } from './dto/filters-product.dto';
import { ExcelService } from '../excel/excel.service';
import { AwsService } from 'src/aws/aws.service';
import { PaginationArgs } from 'src/utils/pagination/pagination.dto';
import { Paginate } from 'src/utils/pagination/parsing';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly excel: ExcelService,
    private readonly aws: AwsService,
    private readonly i18n: I18nService,
  ) { }

  async findAll(filters: FilterProductDto & PaginationArgs) {
    try {
      const where: any = { isDeleted: false };
      const {
        page = 1,
        limit = 10,
        name,
        minPrice,
        maxPrice,
        categoryId,
      } = filters;

      if (name) where.name = { contains: name, mode: 'insensitive' };
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = Number(minPrice);
        if (maxPrice) where.price.lte = Number(maxPrice);
      }
      if (categoryId) {
        where.categories = {
          some: { categoryId },
        };
      }

      const [total, products] = await this.prisma.$transaction([
        this.prisma.product.count({ where }),
        this.prisma.product.findMany({
          where,
          include: {
            images: {
              select: { id: true, url: true, isPrincipal: true },
            },
            categories: {
              select: {
                category: {
                  select: { name: true },
                },
              },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { name: 'desc' },
        }),
      ]);

      const formattedProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        images: product.images,
        categories: product.categories.map((pc) => pc.category.name),
      }));

      return Paginate(formattedProducts, total, { page, limit });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        await this.i18n.t('error.PRODUCT_NOT_FOUND'),
        error,
      );
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.prisma.product.findFirst({
        where: { id, isDeleted: false },
        include: {
          images: {
            select: {
              id: true,
              url: true,
              altText: true,
            },
          },
          categories: {
            select: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundException(
          await this.i18n.t('error.PRODUCT_ID_NOT_FOUND'),
        );
      }
      return product;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        await this.i18n.t('error.PRODUCT_NOT_FOUND'),
        error.response.message,
      );
    }
  }

  async createProduct(
    product: CreateProductDto,
    images: Express.Multer.File[],
  ) {
    try {
      const newProduct = await this.prisma.$transaction(async (tx) => {
        const { name, description, price, stock, categories } = product;

        // Verificar si el nombre de producto ya existe.
        const productExists = await tx.product.findFirst({
          where: { name: { equals: name, mode: 'insensitive' } },
        });
        if (productExists) {
          throw new BadRequestException(
            await this.i18n.t('error.PRODUCT_EXISTS'),
          );
        }
        //verifica que todas las categorías existan, retorna true si todas las categorías existen
        const areValidCategories = await this.validateCategories(categories);
        if (!areValidCategories) {
          throw new BadRequestException(
            'Algunas categorías no existen o fueron eliminadas',
          );
        }

        const createdProduct = await tx.product.create({
          data: {
            name,
            description: description || null,
            price,
            stock,
            // Crear las relaciones con las categorías directamente
            categories: {
              create: categories.map((categoryId) => ({
                categoryId: categoryId,
              })),
            },
          },
          include: {
            categories: true,
          },
        });

        //subir imagenes a s3
        if (images && images.length > 0) {
          console.log(images);
          const imagePromises = images.map(async (image) => {
            const imageUrl = await this.aws.uploadImage(
              image,
              createdProduct.id,
            );
            return tx.image.create({
              data: {
                url: imageUrl,
                productId: createdProduct.id,
              },
            });
          });
          await Promise.all(imagePromises);
        }
        return createdProduct;
      });
      return {
        message: await this.i18n.t('success.CREATED_PRODUCT'),
        newProduct,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        await this.i18n.t('success.PRODUCT_CREATION_FAILED'),
        error.response?.message,
      );
    }
  }

  async uploadProduct(file: Express.Multer.File) {
    try {
      const columnasRequeridas = [
        'Nombre',
        'Precio',
        'Stock',
        'Descripcion',
        'Categoria',
      ];

      // Se lee el contenido del Excel utilizando el servicio ExcelService
      const datos = await this.excel.readExcel(file.buffer, columnasRequeridas);

      //se parsean los datos
      const products = datos
        .map((row: any) => {
          const name = row['Nombre'];
          const price = parseFloat(row['Precio']);
          const stock = parseInt(row['Stock'], 10);
          const description = row['Descripcion'];
          const categories = row['Categoria'];
          //se valida que los datos sean correctos
          if (!name || isNaN(price) || !categories || isNaN(stock)) {
            return null;
          }

          return { name, price, stock, description, categories };
        })
        .filter((product) => product !== null); //se filtra los productos que no son correctos

      if (!products.length) {
        throw new BadRequestException(
          await this.i18n.t('error.NO_VALID_PRODUCT'),
        );
      }
      //se eliminan los productos importados duplicados
      const productosSinDuplicar = products.filter(
        (producto, index, self) =>
          index ===
          self.findIndex(
            (p) => p.name.toLowerCase() === producto.name.toLowerCase(),
          ),
      );

      const result = await this.prisma.$transaction(async (tx) => {
        // verificar que los nombres de los productos no sean duplicados en la base de datos
        const existingNames = await tx.product.findMany({
          where: {
            name: {
              in: productosSinDuplicar.map((p) => p.name),
              mode: 'insensitive',
            },
          },
          select: { name: true }, //solo obtiene el nombre de los productos
        });

        if (existingNames.length > 0) {
          throw new BadRequestException(
            await this.i18n.t('error.PRODUCT_EXISTS', {
              args: { names: existingNames.map((p) => p.name).join(', ') },
            }),
          );
        }

        // Parsea todas las categorías a un arreglo
        const allCategories = [
          ...new Set(
            productosSinDuplicar.flatMap((p) =>
              p.categories.split(',').map((c) => c.trim()),
            ),
          ),
        ];

        //obtener los ids de las categorías
        const categoryIds = await this.prisma.category.findMany({
          where: { name: { in: allCategories } },
          select: { id: true },
        });

        //valida que todas las categorías existan
        const areValidCategories = await this.validateCategories(
          categoryIds.map((c) => c.id),
        );
        if (!areValidCategories) {
          throw new BadRequestException(
            'Algunas categorías no existen o fueron eliminadas',
          );
        }

        const createdProducts = [];
        for (const producto of productosSinDuplicar) {
          //crear el producto
          const createdProduct = await tx.product.create({
            data: {
              name: producto.name,
              price: producto.price,
              stock: producto.stock,
              description: producto.description,
            },
          });
          const categoryNames = producto.categories
            .split(',')
            .map((c) => c.trim());

          //obtener los ids de las categorías
          const categoryIds = await tx.category.findMany({
            where: {
              name: {
                in: categoryNames,
                mode: 'insensitive',
              },
            },
            select: { id: true },
          });

          //asignar categorías al producto
          await tx.productCategory.createMany({
            data: categoryIds.map((categoryId) => ({
              productId: createdProduct.id,
              categoryId: categoryId.id,
            })),
          });

          createdProducts.push(createdProduct);
        }

        return createdProducts;
      });

      return {
        message: await this.i18n.t('error.PRODUCTS_IMPORTED'),
        cantidad: result.length,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        (await this.i18n.t('error.PRODUCTS_IMPORT_FAILED')) + error.message,
      );
    }
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    try {
      const updatedProduct = await this.prisma.$transaction(async (tx) => {
        const { name, description, price, stock, categories } =
          updateProductDto;

        // Buscar el producto a actualizar que no esté eliminado.
        const productExists = await tx.product.findUnique({
          where: { id, isDeleted: false },
        });

        if (!productExists) {
          throw new NotFoundException(
            await this.i18n.t('error.PRODUCT_ID_NOT_FOUND', { args: { id } }),
          );
        }

        // Preparar los datos de actualización
        const updateData: any = {
          name: name ?? productExists.name,
          description: description ?? productExists.description,
          price: price ?? productExists.price,
          stock: stock ?? productExists.stock,
        };

        // Si hay categorías, validarlas y reemplazarlas correctamente
        if (categories?.length) {
          const areValidCategories = await this.validateCategories(categories);
          if (!areValidCategories) {
            throw new BadRequestException(
              'Algunas categorías no existen o fueron eliminadas',
            );
          }

          // Eliminar las categorías actuales
          await tx.productCategory.deleteMany({
            where: { productId: id },
          });

          // Asociar nuevas categorías usando `createMany()`
          await tx.productCategory.createMany({
            data: categories.map((categoryId) => ({
              productId: id,
              categoryId: categoryId,
            })),
          });
        }

        // Actualizar el producto
        return tx.product.update({
          where: { id },
          data: updateData,
          include: {
            categories: {
              select: {
                category: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        });
      });

      return {
        message: await this.i18n.t('success.UPDATED_PRODUCT'),
        updatedProduct,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        await this.i18n.t('success.PRODUCT_UPDATE_FAILED'),
        error.response.message,
      );
    }
  }

  async removeProduct(id: string) {
    try {
      const productExists = await this.prisma.product.findUnique({
        where: { id, isDeleted: false },
      });
      if (!productExists) {
        throw new NotFoundException(
          await this.i18n.t('error.PRODUCT_NOT_FOUND'),
        );
      }
      const productDeleted = await this.prisma.product.update({
        where: { id },
        data: { isDeleted: true },
      });
      return {
        message: await this.i18n.t('error.DELETED_PRODUCT'),
        productDeleted,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        await this.i18n.t('error.PRODUCT_DELETION_FAILED'),
        error.response.message,
      );
    }
  }

  async restoreProduct(id: string) {
    try {
      const productExists = await this.prisma.product.findUnique({
        where: { id },
      });
      if (!productExists) {
        throw new NotFoundException(
          await this.i18n.t('error.PRODUCT_NOT_FOUND'),
        );
      }
      if (!productExists.isDeleted) {
        throw new BadRequestException(
          await this.i18n.t('error.ACTIVE_PRODUCT'),
        );
      }
      const restoredProduct = await this.prisma.product.update({
        where: { id },
        data: { isDeleted: false },
      });
      return {
        message: await this.i18n.t('error.PRODUCT_RESTORED'),
        restoredProduct,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        await this.i18n.t('error.PRODUCT_RESTORED_FAILED'),
        error.response.message,
      );
    }
  }

  //verifica que todas las categorías existan
  async validateCategories(categoryId: string[]) {
    const existingCategories = await this.prisma.category.findMany({
      where: { id: { in: categoryId }, isDeleted: false },
      select: { id: true },
    });

    //compara los ids de las categorías existentes con los ids de las categorías que se están creando
    const foundCategoryIds = existingCategories.map((c) => c.id);
    const missingCategories = categoryId.filter(
      (id) => !foundCategoryIds.includes(id),
    );

    if (missingCategories.length > 0) {
      return false;
    }

    return true;
  }

  //asociar categorías a un producto
  async associateCategories(productId: string, categoryIds: string[]) {
    console.log(productId, categoryIds);
    try {
      //genera nuevas relaciones
      await this.prisma.productCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          productId,
          categoryId,
        })),
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        await this.i18n.t('error.CATEGORY_ASSOCIATION_FAILED'),
        error.response,
      );
    }
  }

  async mostBoughtProducts(limit?: number) {
    const purchases = await this.prisma.cart.findMany({
      where: { status: 'COMPLETED' },
      include: { items: true },
    });

    const products: { id: string, name: string, price: number, quantity: number, images: any[] }[] = [];

    for (const purchase of purchases) {
      for (const item of purchase.items) {
        const prod = await this.prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            images: {
              where: { isPrincipal: true },
              take: 1
            }
          },
        });

        if (prod) {
          const existingProduct = products.find((p) => p.id === prod.id);

          if (existingProduct) {
            existingProduct.quantity += item.quantity;
          } else {
            products.push({
              id: prod.id,
              name: prod.name,
              price: prod.price,
              images: prod.images,
              quantity: item.quantity,
            });
          }
        }
      }
    }

    products.sort((a, b) => b.quantity - a.quantity);
    return limit && Number(limit) > 0 ? products.slice(0, Number(limit)) : products;
  };

}
