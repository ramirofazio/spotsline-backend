import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientsService } from 'src/clients/clients.service';

@Module({
  providers: [AuthService, PrismaService, ClientsService],
  controllers: [AuthController],
})
export class AuthModule {}
