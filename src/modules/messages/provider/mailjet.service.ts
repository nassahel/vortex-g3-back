import { Logger } from '@nestjs/common';
import { Client } from 'node-mailjet';
import { messagingConfig } from 'src/common/constants';
import { Email, EmailService } from '../messages.types';
import { I18nService } from 'nestjs-i18n';

export class MailjetService implements EmailService {
  private logger = new Logger(MailjetService.name);
  private client: Client;

  constructor(    private readonly i18n: I18nService,) {
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
      .then(async () => {
        this.logger.debug(await this.i18n.t('error.EMAIL_SENT', { args: { to } }));
      })
      .catch(async (error) => {
        this.logger.error(await this.i18n.t('error.EMAIL_FAILED', error.stack));
        console.error(await this.i18n.t('error.MAILJET_ERROR', error));
      });
  }
}
