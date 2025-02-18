import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateLoginDto,
  CreateRegisterDto,
  RecoveryPasswordDto,
} from './dto/create-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MessageService } from '../messages/messages.service';
import { messagingConfig } from 'src/common/constants';
import { recoveryTemplate } from '../messages/templates/recovery-template';
import { registrationTmplate } from '../messages/templates/registration-success';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private messageService: MessageService,
  ) {}
  async register(createRegisterDto: CreateRegisterDto) {
    const { email, name, password, repeatPassword } = createRegisterDto;

    const formattedEmail = email.toLowerCase();
    const userExist = await this.prisma.user.findUnique({
      where: { email: formattedEmail },
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
        email: formattedEmail,
        password: await bcrypt.hash(password, 15),
      };

      const registeredUser = await this.prisma.user.create({
        data: newUser,
      });

      if (!registeredUser) {
        throw new BadRequestException('No se pudo registrar al usuario');
      }

      const link = `https://luxshop.com/`;
      let emailBody = registrationTmplate;
      emailBody = emailBody.replace(/{{name}}/g, name);
      emailBody = emailBody.replace(/{{link}}/g, link);

      await this.messageService.sendRegisterUserEmail({
        from: messagingConfig.emailSender,
        to: email,
        subject: 'LuxShop - Registro exitoso!',
        emailBody,
      });

      return {
        message: 'Usuario registrado con éxito!',
        newUser: {
          name,
          emailLower: formattedEmail,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('No se pudo registrar al usuario');
    }
  }

  async login(
    createLoginDto: CreateLoginDto,
  ): Promise<{ message: string; token: string }> {
    const { password, email } = createLoginDto;
    const formattedEmail = email.toLowerCase();
    const userExist = await this.prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    if (!userExist) {
      throw new NotFoundException('Credenciales invalidas.');
    }

    const passwordsMatch = await bcrypt.compare(password, userExist.password);

    if (!passwordsMatch) {
      throw new BadRequestException('Credenciales invalidas.');
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

  async RequestRecoveryPassword(email: string) {
    const formattedEmail = email.toLowerCase();
    const foundUser = await this.prisma.user.findUnique({
      where: { email: formattedEmail },
    });
    if (!foundUser) {
      throw new BadRequestException('User not found');
    }

    try {
      const payload = { id: foundUser.id, email: foundUser.email };
      const token = this.jwt.sign(payload, { expiresIn: '30m' });

      const link = `https://tu-dominio.com/reset-password?token=${token}`;

      //Obtengo la plantilla y le reemplazo las variables
      let emailBody = recoveryTemplate;
      emailBody = emailBody.replace(/{{link}}/g, link);
      emailBody = emailBody.replace(/{{name}}/g, foundUser.name);

      await this.messageService.sendRegisterUserEmail({
        from: messagingConfig.emailSender,
        to: email,
        subject: 'LuxShop - Recuperacion de contraseña',
        emailBody,
      });

      return {
        message: 'Link de recuperación de contraseña generado',
        token,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'No se pudo enviar recuperación de contraseña',
      );
    }
  }

  //AQUI DEBERIA IR LA LOGICA PARA MAILJET

  async RecoveryPassword(recoveryPassword: RecoveryPasswordDto) {
    const { newPassword, token } = recoveryPassword;

    try {
      const payload = this.jwt.verify(token);

      const { id } = payload;

      if (!id) {
        throw new BadRequestException('Invalid token payload');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 15);

      await this.prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });

      return {
        message: 'contraseña cambiada con exito',
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expirex token');
    }
  }
}
