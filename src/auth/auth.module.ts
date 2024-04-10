import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { ClientsModule } from 'src/clients/clients.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { MailsModule } from 'src/mails/mails.module';
import { UsersModule } from 'src/users/users.module';
import { ShoppingCartModule } from 'src/shopping-cart/shopping-cart.module'; 
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '15d' },
    }),
    UsersModule,
    PrismaModule,
    MailsModule,
    ShoppingCartModule,
  ],
  providers: [AuthService, { provide: APP_GUARD, useClass: AuthGuard }], //? Delara protegidas todas las rutas de este modulo por default
  controllers: [AuthController],
})
export class AuthModule {}
