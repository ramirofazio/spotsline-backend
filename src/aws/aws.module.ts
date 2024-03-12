import { Module } from '@nestjs/common';
import { awsController } from './aws.controller';
import { awsService } from './aws.service';
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
  controllers: [awsController],
  providers: [
    awsService,
    PrismaService,

    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [awsModule],
})
export class awsModule {}
