import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { AwsService } from '../aws/aws.service';

@Injectable()
export class ProfileService {

    constructor(
        private prisma: PrismaService,
        private awsService: AwsService,
    ) {}
  
    async uploadImage(file: Express.Multer.File, userId: string): Promise<string> {

        if (!file){
            throw new BadRequestException('No file provided');      //en el caso de q no se suba ningun archivo
        }

        if (file.mimetype !== 'image.png' && file.mimetype !== 'image.jpeg'){
          throw new BadRequestException('Only JPEG and PNG files are allowed');
        }

        const imageUrl = await this.awsService.uploadImage(file, userId);       //se encarga de subir el archivo a s3
        if (!file){
            throw new Error('Error uploading image to AWS');
        }

        await this.prisma.user.update({     //actualiza y se asigna la url de la imagen en aws a imageUrl
            where: {id: userId},
            data: { profileImage: imageUrl},
        });
        return imageUrl;
    }

    async deleteImage(userId: string): Promise<{message: string}> {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!user || !user.profileImage) {    //si no encuentra al usuario o si no tiene foto de perfil
        throw new Error('Image not found');
      };

      const imageUrl = user.profileImage;       //se extrae la imagen de perfil almacenada en user y se le asigna a imageUrl
      const url = new URL(imageUrl);            // crea una nueva instancia de URL utilizando imageUrl
      const key = url.pathname.substring(1);    //toma la ruta (path) del objeto url (ej: /path/to/image.jpg) y usa substring(1) para eliminar el primer caracter

      await this.awsService.deleteImage(key);       //elimina la imagen de s3

      await this.prisma.user.update({            //actualiza y se asigna null en aws a profileImage
        where: {id: userId},
        data: {profileImage: null},
      });

      return { message: 'Image successfully deleted' };
    }
}