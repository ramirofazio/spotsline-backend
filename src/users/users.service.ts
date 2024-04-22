import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Client, ClientProfileResponse } from 'src/clients/clients.dto';
import { ClientsService } from 'src/clients/clients.service';
import { SellerService } from 'src/seller/seller.service';
import { Seller, SellerProfileResponse } from 'src/seller/sellers.dto';
import {
  CCorriente,
  CleanOrders,
  OrderBodyDTO,
  SellerUser,
  UpdateCurrentAccountDTO,
  UpdateUserDataDTO,
  User,
  UserOrders,
} from './users.dto';
import { PasswordResetRequestDTO } from 'src/auth/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService } from 'src/products/products.service';
import { OrderProduct, RawOrderProduct } from 'src/products/products.dto';
import { MobbexItem, RequestItemDTO } from 'src/mobbex/mobbex.dto';
import { JwtService } from '@nestjs/jwt';
import { OrdersService } from 'src/orders/orders.service';

@Injectable()
export class UsersService {
  constructor(
    private clients: ClientsService,
    private sellers: SellerService,
    private prisma: PrismaService,
    private products: ProductsService,
    private jwt: JwtService,
    private ordersService: OrdersService,
  ) {}

  async updateUserData({
    id,
    username,
    cuit,
    email,
  }: UpdateUserDataDTO): Promise<HttpStatus.OK> {
    //TODO VER QUE ONDA ESTO CON LOS SELLERS

    try {
      await this.prisma.cliente.update({
        where: { nrocli: id },
        data: {
          fantasia: username,
          cuit: cuit,
          email: email,
        },
      });

      return HttpStatus.OK;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getOneOrder(order_id: string, token: string): Promise<CleanOrders> {
    try {
      const userData: ClientProfileResponse | SellerProfileResponse =
        await this.getUserProfileDataWithJwt(token);

      const userOrders = await this.getUserOrders(userData.id);

      const order = userOrders.find((order) => order.id === order_id);

      if (order.couponId) {
        const coupon = await this.prisma.coupons.findFirst({
          where: {
            id: order.couponId,
          },
        });
        return {
          ...order,
          coupon,
        };
      }
      return order;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserProfileData(
    token: string,
  ): Promise<ClientProfileResponse | SellerProfileResponse> {
    try {
      const userData: ClientProfileResponse | SellerProfileResponse =
        await this.getUserProfileDataWithJwt(token);

      if (userData) {
        return userData;
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserOrders(id: number): Promise<CleanOrders[]> {
    try {
      const { priceList } = await this.findUserById(id);

      const userOrders: UserOrders[] = await this.prisma.web_orders.findMany({
        where: { userId: id },
        select: {
          id: true,
          date: true,
          couponId: true,
          discount: true,
          mobbexId: true,
          total: true,
          subtotal: true,
          type: true,
        },
      });

      if (!userOrders) {
        throw new HttpException(
          'hubo un error al recuperar los datos de las ordenes',
          HttpStatus.NOT_FOUND,
        );
      }

      const cleanOrders: CleanOrders[] = await Promise.all(
        userOrders.map(async (order) => {
          const orderProducts: RawOrderProduct[] =
            await this.prisma.order_products.findMany({
              where: { orderId: order.id },
              select: { productId: true, qty: true },
            });

          if (!orderProducts) {
            throw new HttpException(
              'hubo un error al recuperar los datos de las ordenes',
              HttpStatus.NOT_FOUND,
            );
          }

          const newOrderProducts: RequestItemDTO[] = orderProducts.map(
            (el) => new OrderProduct(el),
          );

          const cleanOrderProducts: MobbexItem[] =
            await this.products.findCheckoutProducts(
              newOrderProducts,
              priceList,
            );

          return {
            ...order,
            products: [...cleanOrderProducts],
          };
        }),
      );

      return cleanOrders;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findUserById(id: number): Promise<User> {
    try {
      //? Solo busca usuarios en la tabla CLIENTE, para crear el checkout
      const client: Client = await this.clients.findById(id);

      if (!client) {
        throw new HttpException('usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      return new User(client);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findUserByEmail(email: string): Promise<User | SellerUser> {
    try {
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
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
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

  async createOrder({
    items,
    transactionId,
    type,
    userId,
    couponId,
    discount,
    deliveryDate,
  }: OrderBodyDTO) {
    try {
      const { email, id, fantasyName, priceList } =
        await this.findUserById(userId);

      const subtotal = await this.products.getOrderProductsData(
        items,
        priceList,
      );

      const totalDiscount = (discount / 100) * subtotal;

      const total = subtotal - totalDiscount;

      if (email && id) {
        //?  Si existe el cliente en la DB
        const newOrder = await this.prisma.web_orders.create({
          data: {
            date: new Date().toISOString(),
            discount: discount,
            couponId: couponId ? couponId : 0,
            email: email,
            mobbexId: transactionId,
            name: fantasyName,
            userId: userId,
            subtotal: subtotal, // TODO Cambiarlo a INT en DB
            total: total,
            type: type,
            deliveryDate: deliveryDate,
          },
        });

        if (newOrder) {
          items.map(async ({ qty, productId }) => {
            await this.prisma.order_products.create({
              data: {
                orderId: newOrder.id,
                productId: productId,
                qty: qty,
              },
            });
          });
        }

        //? Crea la orden para el sistema de gestion
        await this.ordersService.createSystemOrder(newOrder, items);
      }

      return HttpStatus.OK;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserProfileDataWithJwt(
    jwt: string,
  ): Promise<ClientProfileResponse | SellerProfileResponse> {
    try {
      const verify = await this.jwt.verifyAsync(jwt);

      if (!verify) {
        throw new UnauthorizedException();
      }

      const client: Client = await this.clients.findById(verify.sub);

      if (client) {
        return new ClientProfileResponse(client);
      } else {
        const seller: Seller = await this.sellers.findByEmail(verify.sub);

        if (seller) {
          return new SellerProfileResponse(seller);
        }

        throw new HttpException('usuario no encontrado', HttpStatus.NOT_FOUND);
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
