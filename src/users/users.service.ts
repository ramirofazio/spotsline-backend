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
  PedidoCabDTO,
  PedidoDetDTO,
  SellerUser,
  UpdateCurrentAccountDTO,
  UpdateUserDataDTO,
  User,
  web_order_DTO,
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
      console.log(userOrders);
      const order = userOrders.find((order) => order.id === parseInt(order_id));

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

  async getUserOrders(id: number): Promise<any[]> {
    try {
      const { priceList } = await this.findUserById(id);

      const _userOrders: PedidoCabDTO[] = await this.prisma.pedidoCab.findMany({
        where: {
          nrocli: id,
          TotalNet: { not: 0 }, // ? En el caso de que el total neto sea 0 no mostrar en web
        },
        select: {
          id: true, // * order id
          fechaing: true, // * date
          nroped: true, // * mobexId
          TotalNet: true,
        },
      });

      if (!_userOrders) {
        throw new HttpException(
          'No hay ordenes guardadas para este cliente',
          HttpStatus.NOT_FOUND,
        );
      }

      const _cleanOrders: CleanOrders[] = await Promise.all(
        _userOrders.map(async (pedidoCab: PedidoCabDTO) => {
          const { id, TotalNet, nroped, fechaing } = pedidoCab;

          //? Data almacenada en web_orders

          const web_order: web_order_DTO =
            await this.prisma.web_orders.findFirst({
              where: {
                cabeceraid: id,
              },
              select: {
                total: true,
                subtotal: true,
                couponId: true,
                discount: true,
                type: true,
                mobbexId: true,
              },
            });
          //? Productos relacionados
          const orderProducts: PedidoDetDTO[] =
            await this.prisma.pedidoDet.findMany({
              where: { cabeceraid: id },
              select: {
                cantidad: true,
                descri: true,
                marca: true,
              },
            });

          if (!orderProducts) {
            throw new HttpException(
              'hubo un error al recuperar los datos de las ordenes',
              HttpStatus.NOT_FOUND,
            );
          }
          const requestItems = await Promise.all(
            orderProducts.map(async ({ descri, marca, cantidad }) => {
              const productDetail = await this.prisma.stock.findFirst({
                where: { AND: [{ descri, marca }] },
                select: {
                  id: true,
                },
              });
              if (productDetail === null) {
                // ? puede venir null si el TotalNet = 0
                return false;
              }
              return {
                productId: productDetail.id,
                qty: cantidad,
              };
            }),
          );
          const filtered: any[] = [...requestItems].filter((i) => i !== false);
          const newOrderProducts = filtered.map((el) => new OrderProduct(el));

          const cleanOrderProducts: MobbexItem[] =
            await this.products.findCheckoutProducts(
              newOrderProducts,
              priceList,
            );
          if (web_order) {
            return {
              id,
              mobbexId: web_order.mobbexId,
              date: fechaing,
              total: TotalNet,
              subtotal: web_order.subtotal,
              type: web_order.type,
              couponId: web_order.couponId,
              discount: web_order.discount,
              products: [...cleanOrderProducts],
            };
          } else {
            return {
              id,
              mobbexId: nroped,
              date: fechaing,
              total: TotalNet,
              products: [...cleanOrderProducts],
              subtotal: false,
              couponId: false,
              discount: 0,
              type: false,
            };
          }
        }),
      );

      return _cleanOrders;
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
        //* Crea la orden para el sistema de gestion
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
