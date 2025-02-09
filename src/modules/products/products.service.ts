import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FilterProductDto } from './dto/filters-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: FilterProductDto) {
    try {
      const where: any = { isDeleted: false };

      const { name, minPrice, maxPrice, categoryId } = filters;
      if (!name && !minPrice && !maxPrice && !categoryId) {
        const products = await this.prisma.product.findMany({
          where,
        });
        return products;
      }

      if (name) where.name = { contains: name, mode: 'insensitive' };
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = minPrice;
        if (maxPrice) where.price.lte = maxPrice;
      }
      if (categoryId) where.categoryId = categoryId;
      return this.prisma.product.findMany({ where });
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
        include: { category: { select: { name: true } } }, //incluyo el nombre de la categoria
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

  async create(product: CreateProductDto) {
    try {
      const { name, description, price, stock, categoryId } = product;
      const productExists = await this.prisma.product.findFirst({
        where: { name },
      });
      if (productExists) {
        throw new BadRequestException('El producto ya existe.');
      }
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: categoryId, isDeleted: false },
      });
      if (!categoryExists) {
        throw new NotFoundException(
          `Categoria con id ${categoryId} no encontrada.`,
        );
      }
      const newProduct = await this.prisma.product.create({
        data: {
          name,
          description: description || null,
          price,
          stock,
          categoryId,
        },
      });
      return newProduct;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al crear el producto:',
        error.response.message,
      );
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const { name, description, price, stock, categoryId } = updateProductDto;
      const productExists = await this.prisma.product.findUnique({
        where: { id, isDeleted: false },
      });
      if (!productExists) {
        throw new NotFoundException(`Producto con id ${id} no encontrado.`);
      }
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          name: name ?? productExists.name,
          description: description ?? productExists.description,
          price: price ?? productExists.price,
          stock: stock ?? productExists.stock,
          categoryId: categoryId ?? productExists.categoryId,
        },
      });
      return {
        message: 'Producto actualizado correctamente.',
        updatedProduct,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al actualizar el producto:',
        error.response.message,
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
}
