import { Module } from '@nestjs/common';
import { CurrentAccountService } from './current-account.service';
import { CurrentAccountController } from './current-account.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CurrentAccountService],
  controllers: [CurrentAccountController],
})
export class CurrentAccountModule {}
