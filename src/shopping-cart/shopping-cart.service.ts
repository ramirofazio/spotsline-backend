import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShoppingCart, UpdateCart } from './shoppingCart.dto';

@Injectable()
export class ShoppingCartService {
  constructor(private prisma: PrismaService) {}

  async createCart({ items, discount, subtotal, total, userId, coupon }: any) {
    // let res = await this.prisma.shoppingCart.create({
    //   data: {
    //     userId,
    //     discount,
    //     subtotal,
    //     total,
    //     couponId: coupon && discount ? coupon.id : null,
    //   },
    // })

    await this.prisma.$transaction(async (tx) => {
      try {
        const cart = await tx.shoppingCart.create({
          data: {
            userId,
            discount,
            subtotal,
            total,
            couponId: coupon && discount ? coupon.id : null,
          },
        });

        const cartItems = await tx.itemsOnCart.createMany({
          data: items.map((i) => {
            return { ...i, shoppingCartId: cart.id };
          }),
        });
        return HttpStatus.CREATED;
      } catch (err) {
        console.log(err)
        return HttpStatus.CREATED;
      }
    });

  }

  async updateCart({ items, subtotal, total, coupon, id }: UpdateCart) {
    // const cart = await this.prisma.shoppingCart.update({
    //   where: { id },
    //   data: {
    //     total,
    //     subtotal,
    //     coupon: coupon.id,
    //   },
    // });

    return HttpStatus.CREATED;
  }
}
