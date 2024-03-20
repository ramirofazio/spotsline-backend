import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCupon } from './cupons.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CuponsService {
  constructor(private readonly prisma: PrismaService) {}

  async createCupon(body: any): Promise<any> {
    // await this.prisma.cupones.create({})
  }
}
