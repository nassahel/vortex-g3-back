import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ExcelService } from '../excel/excel.service';
import { PaginationArgs } from 'src/utils/pagination/pagination.dto';
import { Paginate } from 'src/utils/pagination/parsing';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly excel: ExcelService,
    private readonly i18n: I18nService,
  ) {}

  async findAll(filters: PaginationArgs) {
    try {
      const { page, limit } = filters;
      const [total, categories] = await this.prisma.$transaction([
        this.prisma.category.count({ where: { isDeleted: false } }),
        this.prisma.category.findMany({
          where: { isDeleted: false },
          orderBy: { name: 'asc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      return Paginate(categories, total, { page, limit });
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        await this.i18n.translate('error.CATEGORY_NOT_FOUND'),
        error,
      );
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          products: {
            where: {
              product: {
                isDeleted: false,
              },
            },
            include: {
              product: {
                include: {
                  images: {
                    select: {
                      id: true,
                      url: true,
                      altText: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!category) {
        throw new NotFoundException(
          await this.i18n.translate('error.CATEGORY_ID_NOT_FOUND', {
            args: { id },
          }),
        );
      }
      return category;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        await this.i18n.translate('error.CATEGORY_NOT_FOUND'),
        error.response.message,
      );
    }
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      const newCategory = await this.prisma.$transaction(async (tx) => {
        const { name } = createCategoryDto;
        const categoryExists = await tx.category.findFirst({
          where: { name },
        });
        if (categoryExists) {
          throw new BadRequestException(
            await this.i18n.translate('error.CATEGORY_ALREADY_EXISTS'),
          );
        }
        return tx.category.create({
          data: { name },
        });
      });
      return {
        message: await this.i18n.translate('success.CATEGORY_CREATED'),
        newCategory,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        await this.i18n.translate('error.CATEGORY_CREATION_FAILED'),
        error.response.message,
      );
    }
  }

  async uploadCategory(file: Express.Multer.File) {
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

      return {
        message: await this.i18n.translate('success.CATEGORY_IMPORTED'),
        cantidad: categories.length,
      };
    } catch (error) {
      throw new BadRequestException(
        (await this.i18n.translate('error.CATRGORY_IMPORTED_FAILED')) +
          error.message,
      );
    }
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      //verifica que la categoria exista
      const categoryExists = await this.prisma.category.findUnique({
        where: { id, isDeleted: false },
      });
      if (!categoryExists) {
        throw new NotFoundException(
          await this.i18n.translate('error.CATEGORY_ID_NOT_FOUND', {
            args: { id },
          }),
        );
      }
      //verifica que el nombre de la categoria no exista
      const categoryNameExist = await this.prisma.category.findFirst({
        where: { name: updateCategoryDto.name, isDeleted: false },
      });
      if (categoryNameExist) {
        throw new BadRequestException(
          await this.i18n.translate('error.CATEGORY_ALREADY_EXISTS'),
        );
      }
      //actualiza la categoria
      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: {
          name: updateCategoryDto.name ?? categoryExists.name,
        },
      });
      return {
        message: await this.i18n.translate('success.CATEGORY_UPDATED'),
        updatedCategory,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        await this.i18n.translate('error.CATEGORY_UPDATE_FAILED'),
        error.response.message,
      );
    }
  }

  async removeCategory(id: string) {
    try {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id, isDeleted: false },
      });
      if (!categoryExists) {
        throw new NotFoundException(
          await this.i18n.translate('error.CATEGORY_NOT_FOUND'),
        );
      }
      const deletedCategory = await this.prisma.category.update({
        where: { id },
        data: { isDeleted: true },
      });
      return {
        message: await this.i18n.translate('success.CATEGORY_DELETED'),
        category: deletedCategory,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        await this.i18n.translate('error.CATEGORY_DELETE_FAILED'),
        error.response.message,
      );
    }
  }

  async restoreCategory(id: string) {
    try {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id },
      });
      if (!categoryExists) {
        throw new NotFoundException(
          await this.i18n.translate('error.CATEGORY_NOT_FOUND'),
        );
      }
      if (!categoryExists.isDeleted) {
        throw new BadRequestException(
          await this.i18n.translate('error.CATEGORY_NOT_DELETED'),
        );
      }
      const restoredCategory = await this.prisma.category.update({
        where: { id },
        data: { isDeleted: false },
      });
      return {
        message: await this.i18n.translate('success.CATEGORY_RESTORED'),
        restoredCategory,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        await this.i18n.translate('error.CATEGORY_RESTORE_FAILED'),
        error.response.message,
      );
    }
  }
}
