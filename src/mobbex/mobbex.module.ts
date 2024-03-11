import { Module } from '@nestjs/common';
import { MobbexService } from './mobbex.service';
import { MobbexController } from './mobbex.controller';

import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [PrismaModule, UsersModule, ProductsModule],
  providers: [MobbexService],
  controllers: [MobbexController],
  exports: [MobbexService],
})
export class MobbexModule {}
