import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateLoginDto, CreateRegisterDto } from './dto/create-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) { }
  async register(createRegisterDto: CreateRegisterDto) {
    const { email, name, password, repeatPassword } = createRegisterDto;

    const userExists = await this.prisma.user.findUnique({
      where: { email }
    })

    if (userExists) {
      throw new ConflictException('Ya hay un usuario registrado con ese Email.')
    }

    if (password !== repeatPassword) {
      throw new ConflictException('Las contraseñas no son identicas.')
    }

    try {
      const newUser = {
        Name: name,
        email,
        password: await bcrypt.hash(password, 15)
      }

      await this.prisma.user.create({
        data: newUser
      })


      return {
        message: 'Usuario registrado con éxito!',
        newUser
      };

    } catch (error) {
      throw new InternalServerErrorException('No se pudo registrar al usuario')
    }

  }

  login(createLoginDto: CreateLoginDto) {
    return 'This action adds a new auth';
  }


}
