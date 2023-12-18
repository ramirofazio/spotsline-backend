import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Client, RawClient } from './clients.dto';
import { PasswordResetRequestDTO } from 'src/auth/auth.dto';
import * as bcrypt from 'bcrypt';

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
    clave: true,
    firstSignIn: true,
  };

  async findByEmail(email: string): Promise<Client | null> {
    try {
      const rawClient: RawClient = await this.prisma.cliente.findFirst({
        where: { email: email },
        select: this.clientsSelectOpt,
      });

      if (!rawClient) {
        return null;
      }

      return new Client(rawClient);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async firstTimePassword({ email, newPassword }: PasswordResetRequestDTO) {
    try {
      const client: Client = await this.findByEmail(email);

      if (!client) {
        return null;
      }

      if (client.firstSignIn) {
        throw new UnauthorizedException();
      }

      await this.prisma.cliente.update({
        where: { nrocli: client.id },
        data: { clave: bcrypt.hashSync(newPassword, 10), firstSignIn: true },
      });

      return HttpStatus.OK;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateForgottenPassword({
    email,
    newPassword,
  }: PasswordResetRequestDTO): Promise<HttpStatus> {
    const client: Client = await this.findByEmail(email);

    if (!client) {
      return null;
    }

    await this.prisma.cliente.update({
      where: { nrocli: client.id },
      data: { clave: bcrypt.hashSync(newPassword, 10) },
    });

    return HttpStatus.OK;

    //todo: Estaria bueno que directamente lo loggee y devuela el access_token
  }
}
