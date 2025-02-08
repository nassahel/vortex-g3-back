import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../modules/prisma/prisma.service';
import { AwsService } from '../aws/aws.service';
import { UpdateProfileDto } from './dto/update.profile.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ProfileService {

    constructor(
        private prisma: PrismaService,
        private awsService: AwsService,
        private jwtService: JwtService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}
  
    async uploadImage(file: Express.Multer.File, userId: string): Promise<string> {

        if (!file){
            throw new BadRequestException('No file provided');      //en el caso de q no se suba ningun archivo
        }

        if (file.mimetype !== 'image.png' && file.mimetype !== 'image.jpeg'){
          throw new BadRequestException('Only JPEG and PNG files are allowed');
        }

        const user = await this.prisma.user.findUnique({ where: { id: userId } });  //busca para ver si el usuario ya tiene una imagen de perfil
        if (user && user.profileImage) {
          const imageUrl = user.profileImage;   //extrae la imagen de perfil
          const url = new URL(imageUrl);        // crea una nueva instancia
          const key = url.pathname.substring(1);  //toma el path y le resta uno para eliminarle el /
          await this.awsService.deleteImage(key); //elimina la imagen antigua
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

    async updateProfile(userId: string, updateData: UpdateProfileDto): Promise<any>{
      const updateUser = await this.prisma.user.update({
        where: { id: userId },
        data: { ...updateData },
      });
      return updateUser;
    }

    private async hashPassword(password: string): Promise<string> {
      return await bcrypt.hash(password, 15); 
    }

    async requestPasswordChange(email: string): Promise<void>{
      const user = await this.prisma.user.findFirst({ where: { email } });
      if (!user){
        throw new BadRequestException('User not found');
      }

      const payload = { sub: user.id, email: user.email };
      const token = this.jwtService.sign(payload);

      await this.cacheManager.set(`passwordReset:${user.id}`, token, { ttl: 3600 } as any);

      console.log('Generated token for password reset: ', token);
    }

    //AQUI DEBERIA IR LA LOGICA PARA MAILJET

    async changePassword(token: string, newPassword: string): Promise<void>{
      let payload: any;
      try{
        payload = this.jwtService.verify(token);
      } catch (error) {
        throw new BadRequestException('Invalid or expirex token');
      }

      const userId = payload.sub;
      if (!userId) {
        throw new BadRequestException('Invalid token payload');
      }

      const cachedToken = await this.cacheManager.get(`passwordReset:${userId}`);   //logica para eliminar el tocken del cache
      if (!cachedToken || cachedToken !== token) {
        throw new BadRequestException('Invalid or expired token');
      }

      // Si el token es válido, eliminarlo del cache
      await this.cacheManager.del(`passwordReset:${userId}`);

      const hashedPassword = await this.hashPassword(newPassword);

      await this.prisma.user.update({
        where: {id: userId},
        data: {password: hashedPassword},
      });

    }


}