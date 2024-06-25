import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ClientsModule } from 'src/clients/clients.module';
import { SellerModule } from 'src/seller/seller.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductsModule } from 'src/products/products.module';
import { OrdersModule } from 'src/orders/orders.module';
import { MailsModule } from 'src/mails/mails.module';

@Module({
  imports: [
    ClientsModule,
    SellerModule,
    PrismaModule,
    ProductsModule,
    OrdersModule,
    MailsModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
