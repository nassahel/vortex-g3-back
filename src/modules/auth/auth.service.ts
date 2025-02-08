import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateLoginDto, CreateRegisterDto } from './dto/create-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) { }
  async register(createRegisterDto: CreateRegisterDto) {
    const { email, name, password, repeatPassword } = createRegisterDto;

    const userExist = await this.prisma.user.findUnique({
      where: { email }
    })

    if (userExist) {
      throw new ConflictException('Ya hay un usuario registrado con ese Email.')
    }

    if (password !== repeatPassword) {
      throw new ConflictException('Las contraseñas no son identicas.')
    }

    try {
      const newUser = {
        name: name,
        email,
        password: await bcrypt.hash(password, 15)
      }

      await this.prisma.user.create({
        data: newUser
      })

      return {
        message: 'Usuario registrado con éxito!',
        newUser: {
          name,
          email
        }
      };

    } catch (error) {
      throw new InternalServerErrorException('No se pudo registrar al usuario')
    }
  }

  async login(createLoginDto: CreateLoginDto) {

    const { password, email } = createLoginDto;
    const userExist = await this.prisma.user.findUnique({
      where: { email }
    })

    if (!userExist) {
      throw new NotFoundException('El usuario no existe.')
    }

    const passwordsMatch = await bcrypt.compare(password, userExist.password)

    if (!passwordsMatch) {
      throw new BadRequestException('Contraseña incorrecta.')
    }

    const payload = {
      userId: userExist.id,
      userRol: userExist.rol
    }

    const token = this.jwt.sign(payload, { expiresIn: "24h" })

    return {
      message: 'Usuario logueado',
      token
    };
  }
}
