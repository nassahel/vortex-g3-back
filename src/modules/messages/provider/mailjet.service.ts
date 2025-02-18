import { Logger } from '@nestjs/common';
import { Client } from 'node-mailjet';
import { messagingConfig } from 'src/common/constants';
import { Email, EmailService } from '../messages.types';

export class MailjetService implements EmailService {
  private logger = new Logger(MailjetService.name);
  private client: Client;

  constructor() {
    this.client = new Client({
      apiKey: messagingConfig.apiKey,
      apiSecret: messagingConfig.secret,
      config: { version: 'v3.1' },
    });
  }
  async send(input: Email) {
    const { from, to, subject, body } = input;
    await this.client
      .post('send')
      .request({
        Messages: [
          {
            From: { Email: from },
            To: [{ Email: to }],
            Subject: subject,
            HTMLPart: body,
          },
        ],
      })
      .then(() => {
        this.logger.debug(`Email sent to ${to}`);
      })
      .catch((error) => {
        this.logger.error('Error sending email', error.stack);
        console.error('Mailjet error:', error);
      });
  }
}
