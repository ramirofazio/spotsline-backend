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
    coupon,
  }: ShoppingCart) {
    // let res = await this.prisma.shoppingCart.create({
    //   data: {
    //     userId,
    //     discount,
    //     subtotal,
    //     total,
    //     couponId: coupon && discount ? coupon.id : null,
    //   },
    // })
    
    const [cart] = await this.prisma.$transaction([
      this.prisma.shoppingCart.create({
        data: {
          userId,
          discount,
          subtotal,
          total,
          couponId: coupon && discount ? coupon.id : null,
        },
      })/* ,
      this.prisma.itemsOnCart.createMany({
        data: items
      }) */
    ])
    console.log(items)
    console.log(cart)
    return HttpStatus.CREATED;
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
