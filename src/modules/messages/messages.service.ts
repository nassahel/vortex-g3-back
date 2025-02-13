import { Inject, Injectable } from '@nestjs/common';
import { EMAIL_PROVIDER, EmailService } from './messages.types';

@Injectable()
export class MessageService {
  constructor(@Inject(EMAIL_PROVIDER) private emailService: EmailService) {}

  async sendRegisterUserEmail(input: { from: string; to: string, link: string }) {
    const { from, to, link } = input;
    const subject = 'Bienvenido a la plataforma';
    const body = `Puedes recuperar la contraseña desde este link: ${link}`;

    await this.emailService.send({
      from,
      to,
      subject,
      body,
    });
  }
}