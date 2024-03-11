import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShoppingCartService {
  constructor(private prisma: PrismaService) {}
}
