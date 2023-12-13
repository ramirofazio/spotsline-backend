import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { TestDbCloudModule } from './test-db-cloud/test-db-cloud.module';
import { ClientsModule } from './clients/clients.module';
import { CheckoutModule } from './checkout/checkout.module';
import { ProductsModule } from './products/products.module';
import { MailsModule } from './mails/mails.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    PrismaModule,
    TestDbCloudModule,
    ClientsModule,
    CheckoutModule,
    ProductsModule,
    MailsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
