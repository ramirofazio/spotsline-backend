import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';

import { PrismaModule } from 'src/prisma/prisma.module';
import { ShoppingCartModule } from 'src/shopping-cart/shopping-cart.module';
import { MailsModule } from 'src/mails/mails.module';

@Module({
  imports: [PrismaModule, ShoppingCartModule, MailsModule],
  providers: [ClientsService],
  controllers: [ClientsController],
  exports: [ClientsService],
})
export class ClientsModule {}
