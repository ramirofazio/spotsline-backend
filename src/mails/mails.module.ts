import { Module } from '@nestjs/common';
import { MailsService } from './mails.service';

@Module({
  providers: [MailsService]
})
export class MailsModule {}
