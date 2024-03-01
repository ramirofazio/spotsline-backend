import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/users/users.dto';
import { UsersService } from 'src/users/users.service';
import { CheckoutRequest, MobbexBody, MobbexItem } from './mobbex.dto';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class MobbexService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  async generateBody({
    userId,
    items,
    discount,
  }: CheckoutRequest): Promise<MobbexBody> {
    const { email, priceList }: User =
      await this.usersService.findUserById(userId);
    const mobbexItems: MobbexItem[] =
      await this.productsService.findCheckoutProducts(items, priceList);
    const total = this.calculateTotal(mobbexItems);

    //? MOCK UP
    return {
      total: total,
      currency: 'ARS',
      reference: String(userId),
      description: `Venta WEB para ${email}`,
      items: mobbexItems,
      return_url: 'https://mobbex.com/sale/return?session=56789',
      customer: {
        email: email,
        name: email.split('@')[0],
        identification: String(userId),
      },
    };
  }
  calculateTotal(items: MobbexItem[]): number {
    const itemsTotals: number[] = items.map(({ total }) => total);

    return itemsTotals.reduce((acc, num) => acc + num, 0);
  }
}
