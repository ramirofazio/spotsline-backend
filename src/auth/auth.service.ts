import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ClientsService } from 'src/clients/clients.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { signInDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private clients: ClientsService,
  ) {}

  //! Update ANY
  async signIn({ email, password }: signInDto): Promise<any> {
    try {
      //todo: const client = await this.clients.findByEmail(email)
      const client = await this.prisma.cliente.findFirst({
        where: { email: email },
      });

      if (!client) {
        throw new HttpException('cliente no encontrado', HttpStatus.NOT_FOUND);
      }

      //todo: Logica JTW
      //
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
