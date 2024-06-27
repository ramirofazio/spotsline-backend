import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/users/users.dto';
import { UsersService } from 'src/users/users.service';
import {
  CheckoutRequestDTO,
  MobbexCheckoutBody,
  MobbexItem,
} from './mobbex.dto';
import { ProductsService } from 'src/products/products.service';
import { env } from 'process';

@Injectable()
export class MobbexService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  async webhookResponse(data: any) {
    try {
      console.log('WEBHOOK DATA RAW', data);

      if (data.payment.status.code !== '200') {
        //? EN ESTE BLOQUE A FUTURO SE PUEDEN HACER COSITAS DE EMAIL MARKETING U OTROS FLUJOS CUANDO EL PAGO FALLO
        console.log('PAGO FALLIDO');
        const orderId = data.checkout.reference;

        //? Elimino la orden temporal creada porque fallo el pago
        await this.prisma.web_orders.delete({
          where: { id: orderId, type: 'TEMPORAL' },
        });

        //? Elimino los items de la orden temporal porque fallo el pago
        await this.prisma.order_products.deleteMany({
          where: { orderId },
        });

        console.log('BORRE ORDEN TEMPORAL E ITEMS');

        throw new HttpException(
          JSON.stringify(data.payment.status),
          HttpStatus.BAD_REQUEST,
        );
      }

      const orderId = data.payment.reference;
      const userId = data.customer.identification;
      const transactionId = data.payment.id;
      const type = data.payment.source.type;

      console.log('WEBHOOK DATA:', userId, transactionId, type, orderId);

      //   //? Recupero los items temporales guardados
      //   const items = await this.prisma.checkout_items.findMany({
      //     where: { userId },
      //   });

      //   if (!items) {
      //     throw new HttpException(
      //       'No hay items guardados del checkout',
      //       HttpStatus.NOT_FOUND,
      //     );
      //   }

      //   const cleanItems = items.map((i) => {
      //     return { productId: i.productId, qty: i.productQty };
      //   });

      console.log('llegue aca?');

      //TODO ACA TENGO QUE UPDATEAR LA ORDEN. PUEDO FILTRAR CON LA ULTIMA CREADA  y el total capaz
      await this.prisma.web_orders.update({
        where: { id: orderId, type: 'TEMPORAL' },
        data: { type, mobbexId: transactionId },
      });

      console.log('UPDATEE ORDEN TEMPORAL');

      //TODO ACA MANDAR MAIL Y CREAR SYSTEM ORDER

      /*
! una opcion puede ser crear la orden con una propiedad en false tipo estado,
! entonces aca agarro esta orden y la modifcio nomas.
! Hay que ver como conseguir los datos del envio.
! Probablemente se tendrian que mandar a la hora de hacer el checkout para directamente crear una orden temporal al momento de crear el checkout.
! A analizar...
 */

      //! DEPRECADO
      //? CReo la orden, falta recuperar los datos del descuento y delivery
      //   await this.usersService.createOrder({
      //     userId,
      //     items: cleanItems,
      //     transactionId,
      //     type,
      //     //! ACOMODAR ESTO !!!
      //     couponId: 0,
      //     discount: 0,
      //     deliveryDate: '',
      //     description: '',
      //   });

      //! ELIMINO LOS ITEMS CUANDO TERMINA ESTE FLUJO
      //   await this.prisma.checkout_items.deleteMany({
      //     where: { userId: data.customer.identification },
      //   });
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

      //! DEPRECADO ?
      //? Guardo los items temporalmente en la tabla checkout_items para recuperarlos con el webhook
      //   items.map(async (i) => {
      //     await this.prisma.checkout_items.create({
      //       data: { productId: i.productId, productQty: i.qty, userId: userId },
      //     });
      //   });

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

      console.log('ORDERID + ', orderId);

      //! VER COMO RECUPERAR ESTA ORDEN `TEMPORAL` CREADA

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
