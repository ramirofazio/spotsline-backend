import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { TestDbCloudModule } from './test-db-cloud/test-db-cloud.module';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { MailsModule } from './mails/mails.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ShoppingCartModule } from './shopping-cart/shopping-cart.module';
import { MobbexModule } from './mobbex/mobbex.module';
import { ConfigModule } from '@nestjs/config';
import { AwsModule } from './aws/aws.module';
import { CouponsModule } from './cupons/coupons.module';
@Module({
  imports: [
    PrismaModule,
    TestDbCloudModule,
    ClientsModule,
    ProductsModule,
    MailsModule,
    OrdersModule,
    AuthModule,
    UsersModule,
    ShoppingCartModule,
    MobbexModule,
    AwsModule,
    CouponsModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
