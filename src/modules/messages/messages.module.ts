import { Module, Provider } from '@nestjs/common';
import { MailjetService } from './provider/mailjet.service';
import { EMAIL_PROVIDER } from './messages.types';
import { MessageService } from './messages.service';

const mailServicePrivider: Provider = {
    provide: EMAIL_PROVIDER,
    useClass: MailjetService,
};
@Module({
    providers: [MessageService, mailServicePrivider],
    exports: [MessageService],
})
export class MessageModule { }