import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AwsService } from 'src/aws/aws.service';
import { PrismaService } from '../prisma/prisma.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aws: AwsService,
    private readonly i18n: I18nService,
  ) {}
  async uploadImage(id: string, image: Express.Multer.File, altText: string) {
    try {
      const productExists = await this.prisma.product.findUnique({
        where: { id, isDeleted: false },
      });
      if (!productExists) {
        throw new NotFoundException(await this.i18n.translate('error.PRODUCT_ID_NOT_FOUND', { args: { id } }));
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
        message: await this.i18n.translate('success.UPLOADING_IMAGE'),
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        await this.i18n.translate('error.UPLOADING_IMAGE_ERROR'),
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
      throw new BadRequestException(await this.i18n.translate('error.IMAGE_ERROR'), error);
    }
  }

  async findOne(id: string) {
    try {
      const image = await this.prisma.image.findUnique({
        where: { id },
      });
      if (!image) {
        throw new NotFoundException(await this.i18n.translate('error.IMAGE_NOT_FOUND'));
      }
      return image;
    } catch (error) {
      throw new BadRequestException(await this.i18n.translate('error.IMAGE_NOT_FOUND'), error);
    }
  }

  async deleteImage(id: string): Promise<{ message: string }> {
    try {
      const imageExists = await this.prisma.image.findUnique({
        where: { id },
      });

      if (!imageExists) {
        throw new NotFoundException(await this.i18n.translate('error.IMAGE_ID_NOT_FOUND', { args: { id } }));
      }

      const imageUrl = imageExists.url;
      if (imageUrl) {
        try {
          const url = new URL(imageUrl);
          const key = url.pathname.substring(1);

          await this.aws.deleteImage(key);
        } catch (error) {
          throw new BadRequestException(await this.i18n.translate('error.INVALID_URL'), error);
        }
      }

      await this.prisma.image.delete({ where: { id } });

      return { message: await this.i18n.translate('success.DELETED_SUCCESS') };
    } catch (error) {
      throw new BadRequestException(
        await this.i18n.translate('error.DELETED_ERROR'),
        error,
      );
    }
  }
}
