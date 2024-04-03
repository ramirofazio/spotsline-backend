import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShoppingCart, UpdateCart } from './shoppingCart.dto';

@Injectable()
export class ShoppingCartService {
  constructor(private prisma: PrismaService) {}

  async createCart({
    items,
    discount,
    subtotal,
    total,
    userId,
    couponId,
  }: ShoppingCart) {
    const [cart, item] = await this.prisma.$transaction([
      this.prisma.shoppingCart.create({
        data: {
          userId,
          total,
          discount,
          subtotal,
          couponId,
        },
      }),
      this.prisma.itemsOnCart.createMany({
        data: items
      })
    ])

    return HttpStatus.CREATED;
  }

  async updateCart({ items, subtotal, total, couponId, id }: UpdateCart) {
    const cart = await this.prisma.shoppingCart.update({
      where: { id },
      data: {
        total,
        subtotal,
        couponId,
      },
    });

    return HttpStatus.CREATED;
  }
}
