import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TestDbCloudService {
  constructor(private prisma: PrismaService) {}

  async testDb() {
    const client = await this.prisma.cliente.findFirst();

    if (!client) {
      throw new HttpException(
        '##### CLOUD DB NO CONECTADA #####',
        HttpStatus.PRECONDITION_FAILED,
      );
    }

    console.log('##### CLOUD DB CONECTADA #####');
  }
}
