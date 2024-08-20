import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/users/users.dto';
import { UsersService } from 'src/users/users.service';
import {
  CheckoutRequestDTO,
  MobbexCheckoutBody,
  MobbexItem,
  RequestItemDTO,
} from './mobbex.dto';
import { ProductsService } from 'src/products/products.service';
import { env } from 'process';
import { OrdersService } from 'src/orders/orders.service';
import { MailsService } from 'src/mails/mails.service';

@Injectable()
export class MobbexService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
    private readonly orderService: OrdersService,
    private readonly mail: MailsService,
  ) {}

  //! TODO EL FLUJO DE MOBBEX NO SE ESTA USANDO, DE TODAS FORMAS SE VA A IMPLEMENTAR ASI EN UN FUTURO CUNADO LOS USER PAGUEN.
  //! LAS ORDENES VAN DEL SHOPPING CART AL MODULO DE ORDENES. DONDE SE CREAN LAS WEB-ORDERS Y LAS SYSTEM-ORDERS.

  async webhookResponse(data: any) {
    try {
      const status =
        data?.status?.code || data?.payment?.status?.code || data.status.code;

      if (status !== '200') {
        //! EN ESTE BLOQUE A FUTURO SE PUEDEN HACER COSITAS DE EMAIL MARKETING U OTROS FLUJOS CUANDO EL PAGO FALLO
        const orderId =
          data?.payment?.reference ||
          data?.checkout?.reference ||
          data.reference;

        //? Elimino la orden temporal creada porque fallo el pago
        await this.prisma.web_orders.delete({
          where: { id: orderId, type: 'TEMPORAL' },
        });

        //? Elimino los items de la orden temporal porque fallo el pago
        await this.prisma.order_products.deleteMany({
          where: { orderId },
        });

        throw new HttpException(
          JSON.stringify(data.payment.status),
          HttpStatus.BAD_REQUEST,
        );
      }

      const orderId = data.payment.reference;
      const userId = data.customer.identification;
      const transactionId = data.payment.id;
      const type = data.payment.source.type;

      const { email, fantasyName } = await this.usersService.findUserById(
        Number(userId),
      );

      const newOrder = await this.prisma.web_orders.update({
        where: { id: orderId, type: 'TEMPORAL' },
        data: { type, mobbexId: transactionId },
      });

      const items = await this.prisma.order_products.findMany({
        where: { orderId: newOrder.id },
      });

      const cleanItems: RequestItemDTO[] = items.map(({ productId, qty }) => {
        return { productId, qty };
      });

      await this.orderService.createSystemOrder(newOrder, cleanItems);
      await this.mail.sendConfirmOrderEmail(newOrder, email, fantasyName);

      return HttpStatus.CREATED;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generateBody({
    userId,
    items,
    discount,
    coupon,
    deliveryDate,
    description,
  }: CheckoutRequestDTO): Promise<MobbexCheckoutBody> {
    try {
      const { email, priceList, celphone }: User =
        await this.usersService.findUserById(userId);

      const mobbexItems: MobbexItem[] =
        await this.productsService.findCheckoutProducts(items, priceList);
      const total = this.calculateTotal(mobbexItems, discount);

      //? Creo una orden temporal para confirmar una vez hecho el pago. (en checkoutWebhook)
      const orderId = await this.usersService.createOrder({
        items,
        transactionId: '00000', //? ESTO SE CAMBIA EN WEBHOOK
        type: 'TEMPORAL', //? ESTO SE CAMBIA EN WEBHOOK
        userId,
        couponId: coupon.id ?? 0,
        discount,
        deliveryDate,
        description,
      });

      return {
        webhook: 'https://rfddevelopment.tech/mobbex/webhook',
        webhooksType: 'all',
        total: total,
        currency: 'ARS',
        reference: orderId,
        description: `Venta WEB para ${email}`,
        items: mobbexItems,
        return_url: env.MOBBEX_X_RETURN_URL,
        customer: {
          email: email,
          name: email.split('@')[0],
          identification: String(userId),
          phone: celphone || '000000000',
        },
        test: env.ENV === 'production' ? false : true,

        sources: [
          'naranja',
          'mastercard',
          'mastercard.debit',
          'maestro',
          'visa.debit',
          'visa',
          'cabal',
          'cabal.debit',
          'visa.prepaid',
          'mastercard.prepaid',
        ],
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  calculateTotal(items: MobbexItem[], discount: number): number {
    try {
      const itemsTotals: number[] = items.map(({ total }) => total);

      const total = itemsTotals.reduce((acc, num) => acc + num, 0);

      const totalDiscount = (discount / 100) * total;

      return total - totalDiscount;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
