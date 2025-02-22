import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  // Crear un usuario
  async create(createUserDto: CreateUserDto) {
    try {
      const { email, name, password, rol } = createUserDto;

      const formattedEmail = email.toLowerCase();
      const userExist = await this.prisma.user.findUnique({
        where: { email: formattedEmail },
      });
      if (userExist) {
        throw new ConflictException(
          this.i18n.t('user.error.USER_ALREADY_EXISTS'),
        );
      }

      const hashedPassword = await bcrypt.hash(password, 15);

      const newUser = await this.prisma.user.create({
        data: {
          name,
          email: formattedEmail,
          password: hashedPassword,
          rol,
        },
      });

      return {
        message: this.i18n.t('user.success.USER_REGISTERED'),
        newUser: {
          name: newUser.name,
          email: newUser.email,
          rol: newUser.rol,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(this.i18n.t('user.error.USER_REGISTER_FAILED'));
    }
  }

  // Obtiene todos los usuario, excepto los que tienen borrado logico
  async findAll() {
    try {
      const allUsers = await this.prisma.user.findMany({
        where: { isDeleted: false },
      });

      if (allUsers.length === 0) {
        return { message: this.i18n.t('user.error.USER_NOT_FOUND') };
      }

      return allUsers;
    } catch (error) {
      throw new InternalServerErrorException(this.i18n.t('user.error.USER_NOT_FOUND'));
    }
  }

  // Obtiene todos los usuarios activos
  async findAllActive() {
    try {
      const allActiveUsers = await this.prisma.user.findMany({
        where: { isActive: true },
      });

      if (allActiveUsers.length === 0) {
        return { message: this.i18n.t('user.error.USER_NOT_FOUND') };
      }

      return allActiveUsers;
    } catch (error) {
      throw new InternalServerErrorException(
        this.i18n.t('user.error.USER_NOT_FOUND'),
      );
    }
  }

  // Obtiene todos los usuarios con rol USER
  async findAllUsers() {
    try {
      const allUsers = await this.prisma.user.findMany({
        where: {
          isActive: true,
          rol: 'USER',
        },
      });

      if (allUsers.length === 0) {
        return { message: this.i18n.t('user.error.USER_NOT_FOUND') };
      }

      return allUsers;
    } catch (error) {
      throw new InternalServerErrorException(
        this.i18n.t('user.error.USER_NOT_FOUND'),
      );
    }
  }

  // Obtiene un usuario por su id
  async findOne(id: string) {
    try {
      const foundUser = await this.prisma.user.findUnique({ where: { id } });

      if (!foundUser) {
        throw new NotFoundException(this.i18n.t('user.error.USER_NOT_FOUND'));
      }

      return {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        rol: foundUser.rol,
        isActive: foundUser.isActive,
      };
    } catch (error) {
      throw new InternalServerErrorException(this.i18n.t('user.error.USER_NOT_FOUND'));
    }
  }

  //Actualiza un usuario por id
  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });

      return {
        message: this.i18n.t('user.success.UPDATED_USER_SUCCESS'),
      };
    } catch (error) {
      throw new InternalServerErrorException(this.i18n.t('user.error.UPDATED_ERROR'));
    }
  }

  async logicDelete(id: string) {
    try {
      const foundUser = await this.prisma.user.findUnique({ where: { id } });

      if (!foundUser) {
        throw new NotFoundException(
          this.i18n.t('user.error.USER_NOT_FOUND'),
        );
      }

      await this.prisma.user.update({
        where: { id },
        data: { isDeleted: true },
      });

      return {
        message: this.i18n.t('user.success.DELETED_USER_SUCCESS'),
      };
    } catch (error) {
      throw new InternalServerErrorException(this.i18n.t('user.error.DELETE_USER_FAILED'));
    }
  }

  //borrado definitivo de un usuario
  async remove(id: string) {
    try {
      const foundUser = await this.prisma.user.findUnique({ where: { id } });

      if (!foundUser) {
        throw new NotFoundException(this.i18n.t('user.error.USER_NOT_FOUND'));
      }

      await this.prisma.user.delete({ where: { id } });

      return { message: this.i18n.t('user.success.DELETED_USER_SUCCESS') };
    } catch (error) {
      throw new InternalServerErrorException(this.i18n.t('user.error.DELETE_USER_FAILED'));
    }
  }
}
