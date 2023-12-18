import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SellerService {
  constructor(private prisma: PrismaService) {}

  async getSellers() {
    const sellers = await this.prisma.vende.findMany({
      where: {},
    });
  }
}
