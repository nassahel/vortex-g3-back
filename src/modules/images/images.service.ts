import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AwsService } from 'src/aws/aws.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aws: AwsService,
  ) {}
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

  async findAll(productId: string) {
    try {
      const images = await this.prisma.image.findMany({
        where: { productId },
      });
      return images;
    } catch (error) {
      throw new BadRequestException('Error al obtener las imágenes.', error);
    }
  }

  async findOne(id: string) {
    try {
      const image = await this.prisma.image.findUnique({
        where: { id },
      });
      if (!image) {
        throw new NotFoundException(`Imagen no encontrada.`);
      }
      return image;
    } catch (error) {
      throw new BadRequestException('Error al obtener la imagen.', error);
    }
  }

  async deleteImage(id: string): Promise<{ message: string }> {
    try {
      const imageExists = await this.prisma.image.findUnique({
        where: { id },
      });

      if (!imageExists) {
        throw new NotFoundException(`Imagen con id ${id} no encontrada.`);
      }

      const imageUrl = imageExists.url;
      if (imageUrl) {
        try {
          const url = new URL(imageUrl);
          const key = url.pathname.substring(1);

          await this.aws.deleteImage(key);
        } catch (error) {
          throw new BadRequestException('URL de imagen inválida.', error);
        }
      }

      await this.prisma.image.delete({ where: { id } });

      return { message: 'Imagen eliminada correctamente.' };
    } catch (error) {
      throw new BadRequestException(
        'Error al eliminar la imagen del producto.',
        error,
      );
    }
  }

  async setPrincipalImage(
    id: string,
    productId: string,
  ): Promise<{ message: string }> {
    try {
      // Verifica que la imagen exista
      const image = await this.prisma.image.findUnique({
        where: { id },
        include: { product: true },
      });

      if (!image) {
        throw new NotFoundException(`Imagen con id ${id} no encontrada.`);
      }

      await this.prisma.$transaction(async (tx) => {
        // Se establecen todas las imágenes del producto como no principales
        await tx.image.updateMany({
          where: { productId },
          data: { isPrincipal: false },
        });

        // Se establece la imagen seleccionada como principal
        await tx.image.update({
          where: { id },
          data: { isPrincipal: true },
        });
      });

      return {
        message: 'Imagen principal actualizada correctamente.',
      };
    } catch (error) {
      throw new BadRequestException(
        'Error al actualizar la imagen principal:',
        error,
      );
    }
  }
}
