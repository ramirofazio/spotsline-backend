import { Module } from '@nestjs/common';
import { TestDbCloudService } from './test-db-cloud.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailsModule } from 'src/mails/mails.module';

@Module({
  imports: [MailsModule],
  providers: [TestDbCloudService, PrismaService],
})
export class TestDbCloudModule {}
