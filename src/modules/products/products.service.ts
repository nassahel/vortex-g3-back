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

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly excel: ExcelService,
    private readonly aws: AwsService,
  ) {}

  async findAll(filters: FilterProductDto) {
    try {
      const where: any = { isDeleted: false };

      const { name, minPrice, maxPrice, categoryId, minStock, maxStock } =
        filters;

      //filtro por nombre
      if (name) where.name = { contains: name, mode: 'insensitive' };
      //filtro por precio
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = minPrice;
        if (maxPrice) where.price.lte = maxPrice;
      }
      // Filtro por stock
      if (minStock || maxStock) {
        where.stock = {};
        if (minStock) where.stock.gte = minStock;
        if (maxStock) where.stock.lte = maxStock;
      }
      //filtro por categoria
      if (categoryId) {
        where.categories = {
          some: {
            categoryId: categoryId,
          },
        };
      }
      const products = await this.prisma.product.findMany({
        where,
        include: {
          images: {
            select: {
              url: true,
            },
          },
          categories: {
            select: {
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
      const formattedProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        images: product.images,
        categories: product.categories.map((pc) => pc.category),
      }));
      return formattedProducts;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al obtener los productos: ', error);
    }
  }

  async findAllDeleted() {
    try {
      const products = await this.prisma.product.findMany({
        where: { isDeleted: true },
      });
      return products;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al obtener los productos eliminados: ',
        error,
      );
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.prisma.product.findUnique({
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
        throw new NotFoundException(`Producto con id ${id} no encontrado.`);
      }
      return product;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al obtener el producto: ',
        error.response.message,
      );
    }
  }

  async create(product: CreateProductDto, images: Express.Multer.File[]) {
    try {
      const newProduct = await this.prisma.$transaction(async (tx) => {
        const { name, description, price, stock, categories } = product;

        // Verificar si el nombre de producto ya existe.
        const productExists = await tx.product.findFirst({
          where: { name: { equals: name, mode: 'insensitive' } },
        });
        if (productExists) {
          throw new BadRequestException('El producto ya existe.');
        }
        //verifica que todas las categorías existan, retorna true si todas las categorías existen
        await this.validateCategories(categories);

        const createdProduct = await tx.product.create({
          data: {
            name,
            description: description || null,
            price,
            stock,
            // Crear las relaciones con las categorías directamente
            categories: {
              create: categories.map((categoryId) => ({
                category: {
                  connect: { id: categoryId },
                },
              })),
            },
          },
          include: {
            categories: true,
          },
        });

        //subir imagenes a s3
        if (images && images.length > 0) {
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
      });
      return { message: 'Producto creado correctamente', newProduct };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al crear el producto:',
        error.response?.message,
      );
    }
  }

  async upload(file: Express.Multer.File) {
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
        throw new BadRequestException('No hay productos válidos para importar');
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
            `Los siguientes productos ya existen ${existingNames.map((p) => p.name).join(', ')}`,
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
        //valida que todas las categorías existan
        await this.validateCategories(allCategories);

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
          const categories = producto.categories
            .split(',')
            .map((c) => c.trim());
          //asignar categorías al producto
          await tx.productsOnCategories.createMany({
            data: categories.map((categoryId) => ({
              productId: createdProduct.id,
              categoryId,
            })),
          });

          createdProducts.push(createdProduct);
        }

        return createdProducts;
      });

      return {
        message: 'Productos importados correctamente',
        cantidad: result.length,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al importar los productos: ' + error.message,
      );
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const updatedProduct = await this.prisma.$transaction(async (tx) => {
        const { name, description, price, stock, categories } =
          updateProductDto;
        // Buscar el producto a actualizar que no esté eliminado.
        const productExists = await tx.product.findUnique({
          where: { id, isDeleted: false },
        });
        if (!productExists) {
          throw new NotFoundException(`Producto con id ${id} no encontrado.`);
        }

        // Preparar los datos de actualización
        const updateData: any = {
          name: name ?? productExists.name,
          description: description ?? productExists.description,
          price: price ?? productExists.price,
          stock: stock ?? productExists.stock,
        };

        // Si hay categorías, validarlas y agregarlas a los datos de actualización
        if (categories?.length) {
          await this.validateCategories(categories);
          //eliminar las categorías actuales
          await tx.productsOnCategories.deleteMany({
            where: { productId: id },
          });
          updateData.categories = {
            create: categories.map((categoryId) => ({
              category: {
                connect: { id: categoryId },
              },
            })),
          };
        }

        // Actualizar el producto usando los nuevos valores o, en su defecto, los actuales.
        return tx.product.update({
          where: { id },
          data: updateData,
        });
      });
      return {
        message: 'Producto actualizado correctamente.',
        updatedProduct,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al actualizar el producto:',
        error.response,
      );
    }
  }

  async deleteImage(id: string) {
    try {
      const imageExists = await this.prisma.image.findUnique({
        where: { id },
      });
      if (!imageExists) {
        throw new NotFoundException(`Imagen con id ${id} no encontrada.`);
      }
      const imageUrl = imageExists.url;
      const url = new URL(imageUrl); // crea una nueva instancia de URL utilizando imageUrl
      const key = url.pathname.substring(1); //toma la ruta (path) del objeto url (ej: /path/to/image.jpg) y usa substring(1) para eliminar el primer caracter

      await this.aws.deleteImage(key); //elimina la imagen de s3
      //eliminar la imagen de la bd
      await this.prisma.image.delete({
        where: { id },
      });
      return {
        message: 'Imagen eliminada correctamente.',
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al eliminar la imagen del producto:',
        error.response,
      );
    }
  }

  async uploadImage(id: string, image: Express.Multer.File, altText: string) {
    try {
      const productExists = await this.prisma.product.findUnique({
        where: { id, isDeleted: false },
      });
      if (!productExists) {
        throw new NotFoundException(`Producto con id ${id} no encontrado.`);
      }
      //subir la nueva imagen
      const imageUrl = await this.aws.uploadImage(image, id);
      //crear la nueva imagen
      await this.prisma.image.create({
        data: {
          url: imageUrl,
          productId: id,
          altText: altText,
        },
      });
      return {
        message: 'Imagen actualizada correctamente.',
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al actualizar la imagen del producto:',
        error.response,
      );
    }
  }

  async remove(id: string) {
    try {
      const productExists = await this.prisma.product.findUnique({
        where: { id, isDeleted: false },
      });
      if (!productExists) {
        throw new NotFoundException(`Producto con id ${id} no encontrado.`);
      }
      const productDeleted = await this.prisma.product.update({
        where: { id },
        data: { isDeleted: true },
      });
      return {
        message: 'Producto eliminado correctamente.',
        productDeleted,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al eliminar el producto: ',
        error.response.message,
      );
    }
  }

  async restore(id: string) {
    try {
      const productExists = await this.prisma.product.findUnique({
        where: { id, isDeleted: true },
      });
      if (!productExists) {
        throw new NotFoundException(`Producto con id ${id} no encontrado.`);
      }
      const restoredProduct = await this.prisma.product.update({
        where: { id },
        data: { isDeleted: false },
      });
      return {
        message: 'Producto restaurado correctamente.',
        restoredProduct,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al restaurar el producto: ',
        error.response.message,
      );
    }
  }

  //verifica que todas las categorías existan
  async validateCategories(categoryIds: string[]) {
    console.log(categoryIds);
    const existingCategories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds }, isDeleted: false },
    });
    if (existingCategories.length !== categoryIds.length) {
      throw new BadRequestException(
        'Una o más categorías no existen o están eliminadas.',
      );
    }
    return true;
  }
  //asociar categorías a un producto
  async associateCategories(productId: string, categoryIds: string[]) {
    console.log(productId, categoryIds);
    try {
      //genera nuevas relaciones
      await this.prisma.productsOnCategories.createMany({
        data: categoryIds.map((categoryId) => ({
          productId,
          categoryId,
        })),
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al asociar categorías al producto: ',
        error.response,
      );
    }
  }
}
