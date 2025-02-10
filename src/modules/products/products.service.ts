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

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly excel: ExcelService,
  ) {}

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
      //filtro por nombre
      if (name) where.name = { contains: name, mode: 'insensitive' };
      //filtro por precio
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = minPrice;
        if (maxPrice) where.price.lte = maxPrice;
      }
      //filtro por categoria
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
      const newProduct = await this.prisma.$transaction(async (tx) => {
        const { name, description, price, stock, categoryId } = product;

        // Verificar si el producto ya existe.
        const productExists = await tx.product.findFirst({
          where: { name },
        });
        if (productExists) {
          throw new BadRequestException('El producto ya existe.');
        }

        // Verificar si la categoría existe y no está eliminada.
        const categoryExists = await tx.category.findUnique({
          where: { id: categoryId, isDeleted: false },
        });
        if (!categoryExists) {
          throw new NotFoundException(
            `Categoria con id ${categoryId} no encontrada.`,
          );
        }

        // Insertar el nuevo producto dentro de la transacción.
        return tx.product.create({
          data: {
            name,
            description: description || null,
            price,
            stock,
            categoryId,
          },
        });
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
          const categoryId = row['Categoria'];
          //se valida que los datos sean correctos
          if (!name || isNaN(price) || !categoryId || isNaN(stock)) {
            return null;
          }

          return { name, price, stock, description, categoryId };
        })
        .filter((product) => product !== null); //se filtra los productos que no son correctos

      if (!products.length) {
        throw new BadRequestException('No hay productos válidos para importar');
      }
      //se eliminan los productos importados duplicados
      const productosACrear = products.filter(
        (producto, index, self) =>
          index ===
          self.findIndex(
            (p) => p.name.toLowerCase() === producto.name.toLowerCase(),
          ),
      );

      //VALIDAR NOMBRES
      const nombresProductos = productosACrear.map((producto) => producto.name); //arreglo con los nombre de los productos
      //verifica si los nombres de los productos existen en la base de datos
      const productosExistentes = await this.prisma.product.findMany({
        where: {
          isDeleted: false,
          name: { in: nombresProductos },
        },
      });

      //se filtran los productos existentes en la bd
      const productosFiltrados = productosACrear.filter(
        (producto) =>
          !productosExistentes.some((p) => p.name === producto.name),
      );

      //VALIDAR CATEGORIAS
      const idCategoriaProductos = productosFiltrados.map(
        (prod) => prod.categoryId,
      );
      const categoriasValidas = await this.prisma.category.findMany({
        where: { isDeleted: false, id: { in: idCategoriaProductos } },
      });
      //se filtran los productos con categorias no existentes
      const productosValidos = productosFiltrados.filter((prod) =>
        categoriasValidas.some((c) => c.id === prod.categoryId),
      );

      //se almacenan los productos
      await this.prisma.$transaction(async (tx) => {
        await tx.product.createMany({
          data: productosValidos,
        });
      });

      return {
        message: 'Productos importados correctamente',
        cantidad: productosValidos.length,
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
        // Buscar el producto a actualizar que no esté eliminado.
        const productExists = await tx.product.findUnique({
          where: { id, isDeleted: false },
        });
        if (!productExists) {
          throw new NotFoundException(`Producto con id ${id} no encontrado.`);
        }

        // Actualizar el producto usando los nuevos valores o, en su defecto, los actuales.
        return tx.product.update({
          where: { id },
          data: {
            name: updateProductDto.name ?? productExists.name,
            description:
              updateProductDto.description ?? productExists.description,
            price: updateProductDto.price ?? productExists.price,
            stock: updateProductDto.stock ?? productExists.stock,
            categoryId: updateProductDto.categoryId ?? productExists.categoryId,
          },
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
