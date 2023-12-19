import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ClientsModule } from 'src/clients/clients.module';
import { SellerModule } from 'src/seller/seller.module';

@Module({
  imports: [ClientsModule, SellerModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
