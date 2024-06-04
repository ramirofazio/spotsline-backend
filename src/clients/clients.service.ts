import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddEmailBodyDTO,
  Client,
  ManagedClientResponse,
  RawClient,
} from './clients.dto';
import { PasswordResetRequestDTO } from 'src/auth/auth.dto';
import * as bcrypt from 'bcrypt';
import { formatPage } from 'src/utils/pagination';
import { JwtService } from '@nestjs/jwt';
import { Decimal } from '@prisma/client/runtime/library';
import { ShoppingCartService } from 'src/shopping-cart/shopping-cart.service';
import { ShoppingCart } from 'src/shopping-cart/shoppingCart.dto';
import { env } from 'process';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private shoppingCart: ShoppingCartService,
  ) {}

  selectOpt = {
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
    web_role: true,
    codven: true,
    condicion: true,
    expreso: true,
    locali: true,
    avatar: true,
  };

  async findById(id: number): Promise<Client | null> {
    try {
      const rawClient: RawClient = await this.prisma.cliente.findFirst({
        where: { nrocli: id, NOT: { email: '' } },
        select: this.selectOpt,
      });

      if (!rawClient) {
        return null;
      }

      return new Client(rawClient);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async findByEmail(email: string): Promise<Client | null> {
    try {
      const rawClient: RawClient = await this.prisma.cliente.findFirst({
        where: { email: { contains: email }, NOT: { email: '' } },
        select: this.selectOpt,
      });

      if (rawClient?.web_role === null) {
        await this.prisma.cliente.update({
          where: { nrocli: rawClient.nrocli },
          data: { web_role: Number(env.USER_ROLE) },
        });
      }

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

      if (!client.firstSignIn) {
        //? si el cliente ya hizo su primer inicio, tira el error
        throw new UnauthorizedException();
      }

      //? Pongo firstSignIn en true para chequear que ya hizo su primer inicio
      await this.prisma.cliente.update({
        where: { nrocli: client.id },
        data: { clave: bcrypt.hashSync(newPassword, 10), firstSignIn: false },
      });

      return HttpStatus.OK;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateForgottenPassword({
    email,
    newPassword,
  }: PasswordResetRequestDTO): Promise<Client> {
    try {
      const client: Client = await this.findByEmail(email);
      if (!client) {
        return null;
      }

      const updated = await this.prisma.cliente.update({
        where: { nrocli: client.id },
        data: { clave: bcrypt.hashSync(newPassword, 10) },
      });

      HttpStatus.OK;
      return new Client(updated);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllRawClients(page?: number): Promise<RawClient[]> {
    const take = 100;
    page = formatPage(page);
    const skip = take * page - take;

    try {
      return await this.prisma.cliente.findMany({
        select: this.selectOpt,
        where: { NOT: { inhabilitado: false } },
        take,
        skip,
        orderBy: { fantasia: 'asc' },
      });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDashboardClients(page: number): Promise<Client[]> {
    try {
      const RawClients: RawClient[] = await this.getAllRawClients(page);
      return RawClients.map((rc) => new Client(rc));
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addEmailToClient({
    clientId,
    newEmail,
  }: AddEmailBodyDTO): Promise<HttpStatus> {
    try {
      const exist = await this.prisma.cliente.findFirst({
        where: { email: newEmail },
      });

      if (exist) {
        throw new HttpException('El Email ya esta en uso', HttpStatus.CONFLICT);
      }

      await this.prisma.cliente.update({
        where: { nrocli: clientId },
        data: { email: newEmail },
      });

      return HttpStatus.OK;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async getManagedClients(token: string) {
    const verify = await this.jwt.verifyAsync(token);

    const vende = await this.prisma.vende.findFirst({
      where: { id: verify.sub },
    });

    const sellerClients: ManagedClientResponse[] = await this.getSellerClients(
      vende.codven,
    );

    return sellerClients.map((mc) => new ManagedClientResponse(mc));
  }

  async getSellerClients(codven: Decimal) {
    try {
      const clients: RawClient[] = await this.prisma.cliente.findMany({
        where: { codven: codven, NOT: { id: 0 } },
      });

      //? Agarra los clientes a gestionar y si no tiene shopping cart manda prop en false para que se dispare el pedido desde el front
      const res = Promise.all(
        clients.map(async (c) => {
          const cleanClient = new Client(c);

          const shoppingCart: ShoppingCart | null =
            await this.shoppingCart.getCart(cleanClient.id);

          return new ManagedClientResponse({
            avatar: cleanClient.avatar,
            email: cleanClient.email,
            fantasyName: cleanClient.fantasyName,
            id: cleanClient.id,
            shoppingCart: Boolean(shoppingCart),
            priceList: cleanClient.priceList,
          });
        }),
      );

      return res;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
