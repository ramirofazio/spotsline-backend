import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { RoleService } from './role/role.service';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, RoleService],
})
export class AppModule {}
