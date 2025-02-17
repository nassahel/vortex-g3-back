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

  findAll() {
    return `This action returns all images`;
  }

  findOne(id: number) {
    return `This action returns a #${id} image`;
  }

  /* update(id: number, updateImageDto: UpdateImageDto) {
    return `This action updates a #${id} image`;
  } */

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
          throw new BadRequestException('URL de imagen inválida.');
        }
      }

      await this.prisma.image.delete({ where: { id } });

      return { message: 'Imagen eliminada correctamente.' };
    } catch (error) {
      throw new BadRequestException(
        'Error al eliminar la imagen del producto.',
      );
    }
  }
}
