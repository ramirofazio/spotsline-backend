import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/users/users.dto';
import { UsersService } from 'src/users/users.service';
import {
  CheckoutRequestDTO,
  MobbexCheckoutBody,
  MobbexItem,
  MobbexPayOrderBody,
  PaymentOrderDTO,
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

  async generatePayOrderBody({
    total,
    userId,
  }: PaymentOrderDTO): Promise<MobbexPayOrderBody> {
    const { email, fantasyName }: User =
      await this.usersService.findUserById(userId);
    //TODO Aca deberia crear una orden de pago con estado `pending` para luego modificarlo a `complete` cuando se confirme el pago (Catchear return de mobbex y hacer post a `/order/confirm` o algo asi)

    return {
      total: total,
      reference: `Fecha: ${new Date().toLocaleDateString()}. Cliente: ${email}.`,
      description: `${fantasyName} quiere pagar $${total} de su Cuenta Corriente.`,
      return_url: env.MOBBEX_X_RETURN_URL,
    };
  }

  async generateBody({
    userId,
    items,
    discount,
  }: CheckoutRequestDTO): Promise<MobbexCheckoutBody> {
    const { email, priceList }: User =
      await this.usersService.findUserById(userId);

    const mobbexItems: MobbexItem[] =
      await this.productsService.findCheckoutProducts(items, priceList);

    const total = this.calculateTotal(mobbexItems, discount);
    //TODO Aca deberia crear una orden de pago con estado `pending` para luego modificarlo a `complete` cuando se confirme el pago (Catchear return de mobbex y hacer post a `/order/confirm` o algo asi)

    return {
      total: total,
      currency: 'ARS',
      reference: `${new Date().toLocaleDateString()} ${String(userId)}`,
      description: `Venta WEB para ${email}`,
      items: mobbexItems,
      return_url: env.MOBBEX_X_RETURN_URL,
      customer: {
        email: email,
        name: email.split('@')[0],
        identification: String(userId),
      },
    };
  }
  calculateTotal(items: MobbexItem[], discount: number): number {
    const itemsTotals: number[] = items.map(({ total }) => total);

    const total = itemsTotals.reduce((acc, num) => acc + num, 0);

    const totalDiscount = (discount / 100) * total;

    return total - totalDiscount;
  }
}