import { Module } from '@nestjs/common';
import { TestDbCloudService } from './test-db-cloud.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [TestDbCloudService, PrismaService],
})
export class TestDbCloudModule {}
