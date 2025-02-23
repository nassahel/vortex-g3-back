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
import { PaginationArgs } from 'src/utils/pagination/pagination.dto';
import { Paginate } from 'src/utils/pagination/parsing';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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
          'Ya hay un usuario registrado con ese Email.',
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
        message: 'Usuario registrado con éxito!',
        newUser: {
          name: newUser.name,
          email: newUser.email,
          rol: newUser.rol,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('No se pudo registrar al usuario');
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
        return { message: 'No hay usuarios.' };
      }

      return Paginate(users, total, { page, limit });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los usuarios.',
        error,
      );
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
        return { message: 'No hay usuarios activos.' };
      }

      return Paginate(activeUsers, total, { page, limit });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los usuarios activos.',
        error,
      );
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
        return { message: 'No hay usuarios activos.' };
      }

      return Paginate(users, total, { page, limit });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los usuarios activos.',
        error,
      );
    }
  }

  // Obtiene un usuario por su id
  async findOne(id: string) {
    try {
      const foundUser = await this.prisma.user.findUnique({ where: { id } });

      if (!foundUser) {
        throw new NotFoundException('El usuario no existe.');
      }

      return {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        rol: foundUser.rol,
        isActive: foundUser.isActive,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener el usuario.');
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
        message: `Usuario ${updatedUser.name} actualizado.`,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar el usuario.');
    }
  }

  async logicDelete(id: string) {
    try {
      const foundUser = await this.prisma.user.findUnique({ where: { id } });

      if (!foundUser) {
        throw new NotFoundException(
          `No se encontró un usuario con el ID: ${id}`,
        );
      }

      await this.prisma.user.update({
        where: { id },
        data: { isDeleted: true },
      });

      return {
        message: `Usuario ${foundUser.name} eliminado.`,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar el usuario.');
    }
  }

  //borrado definitivo de un usuario
  async remove(id: string) {
    try {
      const foundUser = await this.prisma.user.findUnique({ where: { id } });

      if (!foundUser) {
        throw new NotFoundException('El usuario no existe.');
      }

      await this.prisma.user.delete({ where: { id } });

      return { message: 'Usuario borrado con éxito.' };
    } catch (error) {
      throw new InternalServerErrorException('Error al borrar el usuario.');
    }
  }
}
