import { Inject, Injectable } from '@nestjs/common';
import { EMAIL_PROVIDER, EmailService } from './messages.types';

@Injectable()
export class MessageService {
  constructor(@Inject(EMAIL_PROVIDER) private emailService: EmailService) { }

  async sendRegisterUserEmail(input: { from: string; to: string; emailBody: string; subject: string }) {
    const { from, to, emailBody, subject } = input;

    await this.emailService.send({
      from,
      to,
      subject,
      body: emailBody,
    });
  }
}
