import { Module } from '@nestjs/common';
import { AwsS3UploadService } from './aws-s3-upload.service';
import { AwsS3UploadController } from './aws-s3-upload.controller';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
    PrismaModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 3,
      },
    ]),
  ],
  controllers: [AwsS3UploadController],
  providers: [
    AwsS3UploadService,
    PrismaService,

    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [AwsS3UploadModule],
})
export class AwsS3UploadModule {}
