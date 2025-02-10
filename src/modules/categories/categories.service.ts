import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ExcelService } from '../excel/excel.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly excel: ExcelService,
  ) {}

  async findAll() {
    try {
      const categories = await this.prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: { products: { where: { isDeleted: false } } }, //obtiene los productos activos de la categoria
      });
      return categories;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error al obtener las categorías: ', error);
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: { products: { where: { isDeleted: false } } }, //obtiene los productos activos de la categoria
      });
      if (!category) {
        throw new NotFoundException(`Categoría con id ${id} no encontrada.`);
      }
      return category;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        'Error al obtener la categoría: ',
        error.response.message,
      );
    }
  }

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const newCategory = await this.prisma.$transaction(async (tx) => {
        const { name } = createCategoryDto;
        const categoryExists = await tx.category.findFirst({
          where: { name },
        });
        if (categoryExists) {
          throw new BadRequestException('La categoría ya existe.');
        }
        return tx.category.create({
          data: { name },
        });
      });
      return { message: 'Categoría creada correctamente', newCategory };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        'Error al crear la categoría: ',
        error.response.message,
      );
    }
  }

  async upload(file: Express.Multer.File) {
    try {
      const columnasRequeridas = ['Nombre'];

      // Se lee el contenido del Excel utilizando el servicio ExcelService
      const datos = await this.excel.readExcel(file.buffer, columnasRequeridas);

      //se convierte el array de datos a un array de categorías
      const categories = datos.map((row: any) => ({
        name: row['Nombre'],
      }));

      //se almacenan las categorías
      await this.prisma.$transaction(async (tx) => {
        await tx.category.createMany({
          data: categories,
        });
      });
      console.log(categories);
      return {
        message: 'Categorías importadas correctamente',
        cantidad: categories.length,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error al importar las categorías: ' + error.message,
      );
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      //verifica que la categoria exista
      const categoryExists = await this.prisma.category.findUnique({
        where: { id, isDeleted: false },
      });
      if (!categoryExists) {
        throw new NotFoundException(`Categoría con id ${id} no encontrada.`);
      }
      //verifica que el nombre de la categoria no exista
      const categoryNameExist = await this.prisma.category.findFirst({
        where: { name: updateCategoryDto.name, isDeleted: false },
      });
      if (categoryNameExist) {
        throw new BadRequestException('El nombre de la categoría ya existe.');
      }
      //actualiza la categoria
      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: {
          name: updateCategoryDto.name ?? categoryExists.name,
        },
      });
      return {
        message: 'Categoría actualizada correctamente.',
        updatedCategory,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        'Error al actualizar la categoría: ',
        error.response.message,
      );
    }
  }

  async remove(id: string) {
    try {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id, isDeleted: false },
      });
      if (!categoryExists) {
        throw new NotFoundException(`Categoría con id ${id} no encontrada.`);
      }
      const deletedCategory = await this.prisma.category.update({
        where: { id },
        data: { isDeleted: true },
      });
      return {
        message: 'Categoría eliminada correctamente.',
        category: deletedCategory,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        'Error al eliminar la categoría: ',
        error.response.message,
      );
    }
  }

  async restore(id: string) {
    try {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id, isDeleted: true },
      });
      if (!categoryExists) {
        throw new NotFoundException(`Categoría con id ${id} no encontrada.`);
      }
      const restoredCategory = await this.prisma.category.update({
        where: { id },
        data: { isDeleted: false },
      });
      return {
        message: 'Categoría restaurada correctamente.',
        restoredCategory,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        'Error al restaurar la categoría: ',
        error.response.message,
      );
    }
  }
}
