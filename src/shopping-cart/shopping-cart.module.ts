import { Module } from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { ShoppingCartController } from './shopping-cart.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ShoppingCartService],
  controllers: [ShoppingCartController],
  exports: [ShoppingCartService]
})
export class ShoppingCartModule {}
