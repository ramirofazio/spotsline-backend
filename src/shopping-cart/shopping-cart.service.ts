import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShoppingCart, UpdateCart, Item } from './shoppingCart.dto';

@Injectable()
export class ShoppingCartService {
  constructor(private prisma: PrismaService) {}

  async createCart({ items, discount, subtotal, total, userId, coupon }: any) {
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
        console.log(items);
        const cartItems = await tx.itemsOnCart.createMany({
          data: items.map((i: Item) => {
            return { ...i, shoppingCartId: cart.id };
          }),
        });
      } catch (err) {
        console.log(err);
        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
    return HttpStatus.CREATED;
  }

  async updateCart({
    items,
    subtotal,
    total,
    coupon,
    id,
    discount,
  }: UpdateCart) {
    // const updatedCart = await this.prisma.shoppingCart.update({
    //   where: { id },
    //   data: {
    //     total,
    //     subtotal,
    //     discount,
    //     couponId: coupon && discount ? coupon.id : null,
    //   },
    // });
    console.log(id)
    const prevItems = await this.prisma.itemsOnCart.findMany({
      where: { shoppingCartId: id},
      select: {
        productId: true,
        qty: true,
        name: true,
        price: true
      }
    });

    console.log("prev", prevItems)
    console.log("items", items)
    

    return HttpStatus.CREATED;
  }
}
