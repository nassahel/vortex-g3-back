import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLoginDto, CreateRegisterDto } from './dto/create-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}
  async register(createRegisterDto: CreateRegisterDto) {
    const { email, name, password, repeatPassword } = createRegisterDto;

    const userExist = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExist) {
      throw new ConflictException(
        'Ya hay un usuario registrado con ese Email.',
      );
    }

    if (password !== repeatPassword) {
      throw new ConflictException('Las contraseñas no son identicas.');
    }

    try {
      const newUser = {
        name: name,
        email,
        password: await bcrypt.hash(password, 15),
      };

      await this.prisma.user.create({
        data: newUser,
      });

      return {
        message: 'Usuario registrado con éxito!',
        newUser: {
          name,
          email,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'No se pudo registrar al usuario',
        error,
      );
    }
  }

  async login(
    createLoginDto: CreateLoginDto,
  ): Promise<{ message: string; token: string }> {
    const { password, email } = createLoginDto;
    const userExist = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!userExist) {
      throw new NotFoundException('El usuario no existe.');
    }

    const passwordsMatch = await bcrypt.compare(password, userExist.password);

    if (!passwordsMatch) {
      throw new BadRequestException('Contraseña incorrecta.');
    }

    const payload = {
      userId: userExist.id,
      userRol: userExist.rol,
    };

    const token = this.jwt.sign(payload, { expiresIn: '24h' });

    return {
      message: 'Usuario logueado',
      token,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 15);
  }

  async requestPasswordChange(email: string): Promise<void> {
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwt.sign(payload);

    console.log('Generated token for password reset: ', token);
  }

  //AQUI DEBERIA IR LA LOGICA PARA MAILJET

  async changePassword(token: string, newPassword: string): Promise<void> {
    let payload: any;
    try {
      payload = this.jwt.verify(token);
    } catch (error) {
      throw new BadRequestException('Invalid or expired token', error);
    }

    const userId = payload.sub;
    if (!userId) {
      throw new BadRequestException('Invalid token payload');
    }

    /* const cachedToken = await this.cacheManager.get(`passwordReset:${userId}`); //logica para eliminar el tocken del cache
    if (!cachedToken || cachedToken !== token) {
      throw new BadRequestException('Invalid or expired token');
    }

    // Si el token es válido, eliminarlo del cache
    await this.cacheManager.del(`passwordReset:${userId}`); */

    const hashedPassword = await this.hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
