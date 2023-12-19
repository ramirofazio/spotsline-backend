import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

  async findByEmail(email: string): Promise<Client> {
    try {
      const rawClient: RawClient = await this.prisma.cliente.findFirst({
        where: { email: email },
        select: this.clientsSelectOpt,
      });

      if (!rawClient) {
        throw new HttpException('cliente no encontrado', HttpStatus.NOT_FOUND);
      }

      return new Client(rawClient);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async firstTimePassword({
    email,
    newPassword,
  }: PasswordResetRequestDTO): Promise<any> {
    try {
      const client: Client = await this.findByEmail(email);

      if (client.password) {
        throw new HttpException(
          'contraseña existente en cliente',
          HttpStatus.CONFLICT,
        );
      }

      await this.prisma.cliente.update({
        where: { nrocli: client.id },
        data: { clave: bcrypt.hashSync(newPassword, 10) },
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

    await this.prisma.cliente.update({
      where: { nrocli: client.id },
      data: { clave: bcrypt.hashSync(newPassword, 10) },
    });

    return HttpStatus.OK;
    //todo: Estaria bueno que directamente lo loggee y devuela el access_token
  }
}
