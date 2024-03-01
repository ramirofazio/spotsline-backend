import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Client } from 'src/clients/clients.dto';
import { ClientsService } from 'src/clients/clients.service';
import { SellerService } from 'src/seller/seller.service';
import { Seller } from 'src/seller/sellers.dto';
import {
  CCorriente,
  SellerUser,
  UpdateCurrentAccountDTO,
  User,
} from './users.dto';
import { PasswordResetRequestDTO } from 'src/auth/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private clients: ClientsService,
    private sellers: SellerService,
    private prisma: PrismaService,
  ) {}

  async findUserById(id: number): Promise<User> {
    //? Solo busca usuarios en la tabla CLIENTE, para crear el checkout
    const client: Client = await this.clients.findById(id);

    if (!client) {
      throw new HttpException('usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    return new User(client);
  }

  async findUserByEmail(email: string): Promise<User | SellerUser> {
    const client: Client = await this.clients.findByEmail(email);

    if (client) {
      return new User(client);
    } else {
      const seller: Seller = await this.sellers.findByEmail(email);

      if (seller) {
        return new SellerUser(seller);
      }

      throw new HttpException('usuario no encontrado', HttpStatus.NOT_FOUND);
    }
  }

  async firstTimePassword(data: PasswordResetRequestDTO): Promise<HttpStatus> {
    try {
      const clientResponse = await this.clients.firstTimePassword(data);

      if (!clientResponse) {
        const sellerResponse = await this.sellers.firstTimePassword(data);

        if (!sellerResponse) {
          throw new HttpException(
            'usuario no encontrado',
            HttpStatus.NOT_FOUND,
          );
        }

        return sellerResponse;
      }

      return clientResponse;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateForgottenPassword(
    data: PasswordResetRequestDTO,
  ): Promise<Seller | Client> {
    try {
      const clientResponse = await this.clients.updateForgottenPassword(data);

      if (!clientResponse) {
        const sellerResponse = await this.sellers.updateForgottenPassword(data);

        if (!sellerResponse) {
          throw new HttpException(
            'usuario no encontrado',
            HttpStatus.NOT_FOUND,
          );
        }

        return sellerResponse;
      }

      return clientResponse;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getCurrentAccount(nroCli: string): Promise<CCorriente> {
    try {
      const cta = await this.prisma.clicta.findUnique({
        where: { id: Number(nroCli) },
        select: {
          saldo: true,
          debe: true,
          haber: true,
          cobro: true,
          fecha: true,
          fechafac: true,
          tipodoc: true,
          letra: true,
          punto: true,
          numero: true,
          //? Agregar props que sean necesarias
        },
      });

      if (!cta) {
        throw new HttpException(
          'cuenta corriente no encontrada',
          HttpStatus.NOT_FOUND,
        );
      }

      return cta;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateCurrentAccount(
    nroCli: string,
    { cobro, debe, haber, saldo }: UpdateCurrentAccountDTO,
  ): Promise<CCorriente> {
    try {
      const cta = await this.prisma.clicta.update({
        where: { id: Number(nroCli) },
        data: { cobro, debe, haber, saldo },
        select: {
          saldo: true,
          debe: true,
          haber: true,
          cobro: true,
          fecha: true,
          fechafac: true,
          tipodoc: true,
          letra: true,
          punto: true,
          numero: true,
          //? Agregar props que sean necesarias
        },
      });

      if (!cta) {
        throw new HttpException(
          'cuenta corriente no encontrada',
          HttpStatus.NOT_FOUND,
        );
      }

      return cta;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
