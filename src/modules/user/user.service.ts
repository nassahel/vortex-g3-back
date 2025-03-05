import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationArgs } from 'src/utils/pagination/pagination.dto';
import { Paginate } from 'src/utils/pagination/parsing';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) { }

  // Crear un usuario
  async create(createUserDto: CreateUserDto) {
    try {
      const { email, name, password, rol } = createUserDto;

      const formattedEmail = email.toLowerCase();
      const userExist = await this.prisma.user.findUnique({
        where: { email: formattedEmail },
      });
      if (userExist) {
        throw new ConflictException(this.i18n.t('error.USER_ALREADY_EXISTS'));
      }

      const hashedPassword = await bcrypt.hash(password, 15);

      const newUser = await this.prisma.user.create({
        data: {
          name,
          email: formattedEmail,
          password: hashedPassword,
          rol,
        }
      });

      if (newUser) {
        this.prisma.profile.create({
          data: {
            userId: newUser.id,
            profileImage: '',
            address: '',
            dni: '',
            phone: '',


          }
        })
      }

      return {
        message: this.i18n.t('success.USER_REGISTERED'),
        newUser: {
          name: newUser.name,
          email: newUser.email,
          rol: newUser.rol,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(this.i18n.t('error.USER_REGISTER_FAILED'));
    }
  }

  // Obtiene todos los usuario, excepto los que tienen borrado logico
  async findAll(filters: PaginationArgs) {
    try {
      const { page, limit } = filters;
      const [total, users] = await this.prisma.$transaction([
        this.prisma.user.count({ where: { isDeleted: false } }),
        this.prisma.user.findMany({
          where: { isDeleted: false },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      if (users.length === 0) {
        return { message: this.i18n.t('error.USER_NOT_FOUND') };
      }

      return Paginate(users, total, { page, limit });
    } catch (error) {
      throw new InternalServerErrorException(this.i18n.t('error.USER_NOT_FOUND'));
    }
  }

  // Obtiene todos los usuarios activos
  async findAllActive(filters: PaginationArgs) {
    try {
      const { page, limit } = filters;
      const [total, activeUsers] = await this.prisma.$transaction([
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.user.findMany({
          where: { isActive: true },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      if (activeUsers.length === 0) {
        return { message: await this.i18n.t('error.USER_NOT_FOUND') };
      }

      return Paginate(activeUsers, total, { page, limit });
    } catch (error) {
      throw new InternalServerErrorException(this.i18n.t('error.USER_NOT_FOUND'));
    }
  }

  // Obtiene todos los usuarios con rol USER
  async findAllUsers(filters: PaginationArgs) {
    try {
      const { page, limit } = filters;
      const [total, users] = await this.prisma.$transaction([
        this.prisma.user.count({
          where: {
            isActive: true,
            rol: 'USER',
          },
        }),
        this.prisma.user.findMany({
          where: {
            isActive: true,
            rol: 'USER',
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      if (users.length === 0) {
        return { message: this.i18n.t('error.USER_NOT_FOUND') };
      }

      return Paginate(users, total, { page, limit });
    } catch (error) {
      throw new InternalServerErrorException(this.i18n.t('error.USER_NOT_FOUND'));
    }
  }

  // Obtiene un usuario por su id
  async findOne(id: string) {
    try {
      const foundUser = await this.prisma.user.findUnique({
        where: { id },
        include: { profile: true, carts: { include: { items: { include: { product: true } } } } }
      });

      if (!foundUser) {
        throw new NotFoundException(this.i18n.t('error.USER_NOT_FOUND'));
      }

      return {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        rol: foundUser.rol,
        isActive: foundUser.isActive,
        profile: foundUser.profile,
        cart: foundUser.carts
      };
    } catch (error) {
      throw new InternalServerErrorException(this.i18n.t('error.USER_NOT_FOUND'));
    }
  }

  //Actualiza un usuario por id
  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });

      return { message: this.i18n.t('success.UPDATED_USER_SUCCESS') };
    } catch (error) {
      throw new InternalServerErrorException(this.i18n.t('error.UPDATED_ERROR'));
    }
  }

  async logicDelete(id: string) {
    try {
      const foundUser = await this.prisma.user.findUnique({ where: { id } });

      if (!foundUser) {
        throw new NotFoundException(this.i18n.t('error.USER_NOT_FOUND'));
      }

      await this.prisma.user.update({
        where: { id },
        data: { isDeleted: true },
      });

      return {
        message: this.i18n.t('success.DELETED_USER_SUCCESS'),
      };
    } catch (error) {
      throw new InternalServerErrorException(this.i18n.t('error.DELETE_USER_FAILED'));
    }
  }

  //borrado definitivo de un usuario
  async remove(id: string) {
    try {
      const foundUser = await this.prisma.user.findUnique({ where: { id } });

      if (!foundUser) {
        throw new NotFoundException(this.i18n.t('error.USER_NOT_FOUND'));
      }

      await this.prisma.user.delete({ where: { id } });

      return { message: await this.i18n.t('success.DELETED_USER_SUCCESS') };
    } catch (error) {
      throw new InternalServerErrorException(this.i18n.t('error.DELETE_USER_FAILED'));
    }
  }
}
