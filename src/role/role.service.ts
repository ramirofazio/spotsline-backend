import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoleService {
  /* eslint-disable */
  constructor(private prisma: PrismaService) {}
  /* eslint-enable */

  async createRolesIfNotExist() {
    const userRole = await this.prisma.role.findFirst({
      where: { type: 'USER' },
    });
    if (!userRole) {
      await this.prisma.role.create({ data: { type: 'USER' } });
    }

    const adminRole = await this.prisma.role.findFirst({
      where: { type: 'ADMIN' },
    });
    if (!adminRole) {
      await this.prisma.role.create({ data: { type: 'ADMIN' } });
    }
  }
}
