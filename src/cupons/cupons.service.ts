import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CuponsService {
  constructor(private readonly prisma: PrismaService) {}
}
