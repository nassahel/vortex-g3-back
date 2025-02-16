import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AwsService } from '../../aws/aws.service';
import { UpdateProfileDto } from './dto/update.profile.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ProfileService {

    constructor(
        private prisma: PrismaService,
        private awsService: AwsService,
        private jwtService: JwtService,
    ) {}

    async createProfile(userId: string, updateProfileDto: UpdateProfileDto, file: Express.Multer.File){
      if(!userId){
        throw new BadRequestException('No user registered');
      }
      let imageUrl: string | null = null;
      
      if(file){
        imageUrl = await this.awsService.uploadImage(file, userId);
      }
      
      const createdProfile = await this.prisma.profile.create({
        data: {
          userId,
          profileImage: imageUrl,
          address: updateProfileDto.address,
          dni: updateProfileDto.dni,
          birthday: updateProfileDto.birthday,
          phone: updateProfileDto.phone,
        }
      })
      
      return{
        message: 'Profile successfully created',
        data: createdProfile,
      }
      
    }
    
    async uploadImage(file: Express.Multer.File, userId: string) {

      if (!file){
          throw new BadRequestException('No file provided');      //en el caso de q no se suba ningun archivo
      }

      const allowedMimeTypes = ['image/png', 'image/jpeg'];
      if (!allowedMimeTypes.includes(file.mimetype)){
        throw new BadRequestException('Only JPEG and PNG files are allowed');
      }

      const existingProfile = await this.prisma.profile.findUnique({
        where: { userId },
      });

      if (!existingProfile) {
        throw new BadRequestException(`Profile not found for userId: ${userId}`);
      }

      if (existingProfile.profileImage) {
        try {
            const imageUrl = existingProfile.profileImage;
            const url = new URL(imageUrl);
            const key = url.pathname.substring(1); // Remover el primer "/"
            await this.awsService.deleteImage(key);
        } catch (error) {
            console.error("Error deleting previous image:", error);
        }
      }

      const imageUrl = await this.awsService.uploadImage(file, userId);       //se encarga de subir el archivo a s3
      
      if (!file){
          throw new Error('Error uploading image to AWS');
      }

      const updatedProfile = await this.prisma.profile.update({
        where: { userId },
        data: { profileImage: imageUrl},
      });

      return {
        message: 'Profile image updated successfully',
        data: updatedProfile,
      }
    }

    async deleteImage(userId: string): Promise<{message: string}> {
      const user = await this.prisma.profile.findUnique({
        where: { userId },
      });
  
      if (!user || !user.profileImage) {    //si no encuentra al usuario o si no tiene foto de perfil
        throw new Error('Image not found');
      };

      const imageUrl = user.profileImage;       //se extrae la imagen de perfil almacenada en user y se le asigna a imageUrl
      const url = new URL(imageUrl);            // crea una nueva instancia de URL utilizando imageUrl
      const key = url.pathname.substring(1);    //toma la ruta (path) del objeto url (ej: /path/to/image.jpg) y usa substring(1) para eliminar el primer caracter

      await this.awsService.deleteImage(key);       //elimina la imagen de s3

      await this.prisma.profile.update({            //actualiza y se asigna null en aws a profileImage
        where: { userId},
        data: {profileImage: null},
      });

    return { message: 'Image successfully deleted' };
  }

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto){
      const updateUser = await this.prisma.profile.update({
        where: { userId },
        data: { 
          address: updateProfileDto.address,
          dni: updateProfileDto.dni,
          birthday: updateProfileDto.birthday,
          phone: updateProfileDto.phone,
        },
      });
      return updateUser;
    }
    


}
