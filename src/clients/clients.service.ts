import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Client, RawClient } from './clients.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  clientsSelectOpt = {
    nrocli: true,
    razsoc: true,
    fantasia: true,
    direcc: true,
    direcom: true,
    telef1: true,
    cuit: true,
    lista: true,
    email: true,
    cond_vta: true,
    inhabilitado: true,
    visualiza: true,
  };

  async findByEmail(email: string): Promise<Client> {
    const rawClient: RawClient = await this.prisma.cliente.findFirst({
      where: { email: email },
      select: this.clientsSelectOpt,
    });

    return new Client(rawClient);
  }
}
