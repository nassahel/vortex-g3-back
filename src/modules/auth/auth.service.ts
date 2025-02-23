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
import { I18nLang, I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private messageService: MessageService,
    private readonly i18n: I18nService,
  ) {}
  async register(createRegisterDto: CreateRegisterDto) {
    const { email, name, password, repeatPassword } = createRegisterDto;

    const formattedEmail = email.toLowerCase();
    const userExist = await this.prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    if (userExist) {
      throw new ConflictException(
        await this.i18n.translate('error.USER_ALREADY_EXISTS')
      );
    }

    if (password !== repeatPassword) {
      throw new ConflictException(
        await this.i18n.translate('error.PASSWORDS_DO_NOT_MATCH')
      );
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
        throw new InternalServerErrorException(await this.i18n.translate('error.USER_REGISTRATION_FAILED'));
      }

      const link = `https://luxshop.com/`;
      let emailBody = registrationTmplate;
      emailBody = emailBody.replace(/{{name}}/g, name);
      emailBody = emailBody.replace(/{{link}}/g, link);

      await this.messageService.sendRegisterUserEmail({
        from: messagingConfig.emailSender,
        to: email,
        subject: await this.i18n.translate('success.USER_REGISTERED'),
        emailBody,
      });

      return {
        message: await this.i18n.translate('success.USER_REGISTERED'),
        newUser: {
          name,
          emailLower: formattedEmail,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(await this.i18n.translate('error.USER_REGISTRATION_FAILED'));
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
      throw new NotFoundException(await this.i18n.translate('error.INVALID_CREDENTIALS'));
    }

    const passwordsMatch = await bcrypt.compare(password, userExist.password);

    if (!passwordsMatch) {
      throw new BadRequestException(await this.i18n.translate('error.INVALID_CREDENTIALS'));
    }

    const payload = {
      userId: userExist.id,
      userRol: userExist.rol,
    };

    const token = this.jwt.sign(payload, { expiresIn: '24h' });

    return {
      message: await this.i18n.translate('success.LOGGED_IN'),
      token,
    };
  }

  async RequestRecoveryPassword(email: string) {
    const formattedEmail = email.toLowerCase();
    const foundUser = await this.prisma.user.findUnique({
      where: { email: formattedEmail },
    });
    if (!foundUser) {
      throw new BadRequestException(await this.i18n.translate('error.USER_NOT_FOUND'));
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
        subject: await this.i18n.translate('success.PASSWORD_RECOVERY'),
        emailBody,
      });

      return {
        message: await this.i18n.translate('success.RECOVERY_LINK_SENT'),
        token,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        await this.i18n.translate('error.LINK_RECOVERY_FAILED'),
      );
    }
  }

  async RecoveryPassword(recoveryPassword: RecoveryPasswordDto) {
    const { newPassword, token } = recoveryPassword;

    try {
      const payload = this.jwt.verify(token);

      const { id } = payload;

      if (!id) {
        throw new BadRequestException(await this.i18n.translate('error.TOKEN_INVALID'));
      }

      const hashedPassword = await bcrypt.hash(newPassword, 15);

      await this.prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });

      return {
        message: await this.i18n.translate('error.PASSWORD_CHANGED'),
      };
    } catch (error) {
      throw new BadRequestException(await this.i18n.translate('error.TOKEN_EXPIRED'));
    }
  }
}
