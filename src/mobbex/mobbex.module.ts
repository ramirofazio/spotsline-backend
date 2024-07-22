import { Module } from '@nestjs/common';
import { MobbexService } from './mobbex.service';
import { MobbexController } from './mobbex.controller';

import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { OrdersModule } from 'src/orders/orders.module';
import { MailsModule } from 'src/mails/mails.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    MailsModule,
  ],
  providers: [MobbexService],
  controllers: [MobbexController],
  exports: [MobbexService],
})
export class MobbexModule {}
