import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShoppingCart, UpdateCart, Item } from './shoppingCart.dto';

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
    try {
      await this.prisma.$transaction(async (tx) => {
        const cart = await tx.shoppingCart.create({
          data: {
            userId,
            discount,
            subtotal,
            total,
            couponId: coupon && discount ? coupon.id : null,
          },
        });

        await tx.itemsOnCart.createMany({
          data: items.map((i: Item) => {
            return { ...i, shoppingCartId: cart.id };
          }),
        });
      });
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
    try {
      // const updatedCart = await this.prisma.shoppingCart.update({
      //   where: { id },
      //   data: {
      //     total,
      //     subtotal,
      //     discount,
      //     couponId: coupon && discount ? coupon.id : null,
      //   },
      // });

      const prevItems = await this.prisma.itemsOnCart.findMany({
        where: { shoppingCartId: id },
        select: {
          productId: true,
          qty: true,
          name: true,
          price: true,
          img: true,
        },
      });
      console.log(prevItems);

      if (!prevItems?.length) {
        // * Si no hay items previos los crea
        if (items?.length) {
          await this.prisma.itemsOnCart.createMany({
            data: items.map((i: Item) => {
              return { ...i, shoppingCartId: id };
            }),
          });
          return HttpStatus.OK;
        }
        return HttpStatus.NOT_MODIFIED;
      } else if (!items.length) {
        // * Si el cart esta vacio borra los items previos
        await this.prisma.itemsOnCart.deleteMany({
          where: { shoppingCartId: id },
        });
        return HttpStatus.OK;
      } else {
        const sortItems = (arr: Item[]) =>
          arr.sort((a, b) => {
            return a.productId - b.productId;
          });
        sortItems(items);
        sortItems(prevItems);

        for (let index = 0; index < items.length; index++) {
          const itm = items[index];
          const newId = itm.productId;
          // 0 -- 0
          for (
            let prevIndex = index;
            prevIndex < prevItems.length;
            prevIndex++
          ) {
            const prevId = prevItems[prevIndex]?.productId;

            if (newId !== prevId) {
              if (newId < prevId) {
                await this.prisma.itemsOnCart.create({
                  data: { ...itm, shoppingCartId: id },
                });
                continue;
              } else if (newId > prevId) {
                await this.prisma.itemsOnCart.deleteMany({
                  where: {
                    shoppingCartId: id,
                    id: prevId,
                  },
                });
                return;
              }
            } else if (newId === prevId) {
              await this.prisma.itemsOnCart.update({
                where: {
                  id: itm.productId,
                  shoppingCartId: id,
                },
                data: itm,
              });
              return;
            }
          }
        }

        // items.forEach(async (itm, index) => {
        //   const prevId = prevItems[index]?.productId;
        //   const newId = itm.productId;
        //   if (newId !== prevId) {
        //     if (newId < prevId) {
        //       await this.prisma.itemsOnCart.create({
        //         data: { ...itm, shoppingCartId: id },
        //       });
        //     } else if (newId > prevId) {
        //       await this.prisma.itemsOnCart.deleteMany({
        //         where: {
        //           shoppingCartId: id,
        //           id: prevId
        //         }
        //       });
        //     }
        //   }
        // });
        // console.log(prevItems, items);

        return HttpStatus.CREATED;
      }
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
