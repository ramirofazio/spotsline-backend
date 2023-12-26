import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ClientsModule } from 'src/clients/clients.module';
import { SellerModule } from 'src/seller/seller.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [ClientsModule, SellerModule, PrismaModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
