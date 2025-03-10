import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { ProfileDto } from './dto/profile.dto';
import { AwsService } from '../aws/aws.service';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private awsService: AwsService,
    private jwtService: JwtService,
    private readonly i18n: I18nService,
  ) { }

  async getAllProfiles() {
    try {
      const allProfiles = await this.prisma.profile.findMany({
        where: { user: { isActive: true } }
      });
      return allProfiles;
    } catch (error) {
      throw new BadRequestException(await this.i18n.translate('error.PROFILE_NOT_FOUND'), error);
    }
  }

  async createProfile(
    userId: string,
    updateProfileDto: ProfileDto,
    file: Express.Multer.File,
  ) {
    if (!userId) {
      throw new BadRequestException(await this.i18n.t('error.NO_REGISTERED_USER'));
    }
    let imageUrl: string | null = null;

    if (file) {
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
      },
    });

    return {
      message: this.i18n.t('success.CREATED_PROFILE'),
      data: createdProfile,
    };
  }

  //Subir imagen de perfil
  async uploadImage(file: Express.Multer.File, userId: string) {
    if (!file) {
      throw new BadRequestException(this.i18n.t('error.NO_FILE'));
    }
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new BadRequestException(this.i18n.t('error.PROFILE_NOT_FOUND', { args: { userId } }));
    }

    if (existingProfile.profileImage) {
      try {
        const imageUrl = existingProfile.profileImage;
        const url = new URL(imageUrl);
        const key = url.pathname.substring(1);
        await this.awsService.deleteImage(key);
      } catch (error) {
        console.error('Error deleting previous image:', error);
        throw new InternalServerErrorException(this.i18n.t('error.ERROR_DELETING_IMAGE'));
      }
    }

    const imageUrl = await this.awsService.uploadImage(file, userId);
    const updatedProfile = await this.prisma.profile.update({
      where: { userId },
      data: { profileImage: imageUrl },
    });

    return {
      message: this.i18n.t('success.PROFILE_IMAGE_UPLOADED'),
      image: updatedProfile.profileImage,
    };
  }

  async deleteImage(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!user || !user.profileImage) {
      throw new Error(await this.i18n.t('success.IMAGE_NOT_FOUND'));
    }

    const imageUrl = user.profileImage;
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1);

    await this.awsService.deleteImage(key);

    await this.prisma.profile.update({
      where: { userId },
      data: { profileImage: null },
    });

    return { message: await this.i18n.t('success.IMAGE_DELETED') };
  }

  async updateProfile(userId: string, updateProfileDto: ProfileDto) {
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
