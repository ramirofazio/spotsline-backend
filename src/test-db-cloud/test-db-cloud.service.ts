import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { env } from 'process';
const bcrypt = require('bcrypt');

@Injectable()
export class TestDbCloudService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.testDb();
  }

  async testDb() {
    try {
      const client = await this.prisma.cliente.findFirst();

      if (!client) {
        throw new HttpException(
          '##### CLOUD DB NO CONECTADA #####',
          HttpStatus.PRECONDITION_FAILED,
        );
      }

      console.log('##### CLOUD DB CONECTADA #####');

      // Check if test users already exist
      const existingTestUsers = await this.prisma.cliente.findMany({
        where: {
          OR: [
            { email: 'admin@spotsline.com.ar' },
            { email: 'user@spotsline.com.ar' },
          ],
        },
        select: { id: true },
      });

      const existingTestSeller = await this.prisma.vende.findMany({
        where: {
          OR: [{ email: 'seller@spotsline.com.ar' }],
        },
        select: { id: true },
      });

      if (existingTestUsers.length === 2 && existingTestSeller.length === 1) {
        console.log('#### TEST USERS ALREADY EXIST ####');
        return;
      }

      // Create test users
      const newTestUsers = await this.prisma.$transaction(async () => {
        return [
          await this.createTestUser(
            99990,
            'admin@spotsline.com.ar',
            env.ROOT_PASSWORD,
            Number(env.ADMIN_ROLE),
          ),
          await this.createTestUser(
            99991,
            'user@spotsline.com.ar',
            env.ROOT_PASSWORD,
          ),
          await this.createTestSeller(
            99992,
            'seller@spotsline.com.ar',
            env.ROOT_PASSWORD,
            Number(env.SELLER_ROLE),
          ),
        ];
      });

      console.log('#### TEST USERS CREATED ####');
      console.log(newTestUsers); // Log the newly created test users
    } catch (error) {
      console.error('Error during testDb:', error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createTestUser(
    nroCli: number,
    email: string,
    password: string,
    webRole?: number,
  ) {
    return this.prisma.cliente.create({
      data: {
        nrocli: nroCli,
        email,
        clave: bcrypt.hashSync(password, 10),
        web_role: webRole,
        fantasia: email.split('@')[0],
      },
    });
  }

  async createTestSeller(
    codVen: number,
    email: string,
    password: string,
    webRole?: number,
  ) {
    return this.prisma.vende.create({
      data: {
        codven: codVen,
        email,
        clave: bcrypt.hashSync(password, 10),
        web_role: webRole,
        nombre: email.split('@')[0],
        superv: 0,
      },
    });
  }
}
