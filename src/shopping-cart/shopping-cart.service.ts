import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShoppingCart, UpdateCart, Item } from './shoppingCart.dto';

@Injectable()
export class ShoppingCartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: number) {
    try {
      const cart = await this.prisma.shoppingCart.findFirst({
        where: {
          userId,
        },
      });

      if (!cart) {
        return {};
      } else {
        const { couponId, discount, id, subtotal, total, userId } = cart;
        const items = await this.prisma.itemsOnCart.findMany({
          where: {
            shoppingCartId: id,
          },
        });

        if (couponId) {
          const coupon = await this.prisma.coupons.findFirst({
            where: {
              id: cart.couponId,
            },
          });
          return {
            discount,
            subtotal,
            total,
            userId,
            currentCoupon: coupon,
            items,
          };
        } else {
          return {
            discount,
            subtotal,
            total,
            userId,
            currentCoupon: false,
            items,
          };
        }
      }
    } catch (err) {
      console.log(err);
      throw new HttpException(
        'Get cart failed ',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      await this.prisma.shoppingCart.update({
        where: { id },
        data: {
          total,
          subtotal,
          discount,
          couponId: coupon && discount ? coupon.id : null,
        },
      });

      const prev = await this.prisma.itemsOnCart.findMany({
        where: { shoppingCartId: id },
        select: {
          id: true,
          productId: true,
          qty: true,
          name: true,
          price: true,
          img: true,
        },
      });

      if (!prev?.length) {
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
        async function updateItems(prisma, newItems, prevItems) {
          for (let index = 0; index < newItems.length; index++) {
            const itm = newItems[index];
            const newId = itm.productId;

            for (
              let prevIndex = index;
              prevIndex < prevItems.length;
              prevIndex++
            ) {
              const prevId = prevItems[prevIndex]?.productId;

              if (newId !== prevId) {
                // * Si entra hubo modificacion en la cantidad de items
                if (newId < prevId) {
                  // * Si el newId < significa que hay item nuevo
                  await prisma.itemsOnCart.create({
                    data: { ...itm, shoppingCartId: id },
                  });
                  newItems.shift();
                  index--;
                  break;
                } else if (newId > prevId) {
                  // * Si el newId > significa que ese item ya no se guarda
                  await prisma.itemsOnCart.delete({
                    where: {
                      shoppingCartId: id,
                      id: prevItems[prevIndex].id,
                    },
                  });
                  prevItems.shift();
                  index--;
                  break;
                }
              } else if (newId === prevId) {
                // * Si el item ya estaba en la db lo actualiza
                await prisma.itemsOnCart.update({
                  where: {
                    id: prevItems[prevIndex].id,
                    shoppingCartId: id,
                  },
                  data: itm,
                });

                prevItems.shift();
                newItems.shift();
                index--;
                break;
              }
            }
          }
          return { newItems, prevItems };
        }
        const sortItems = (arr: Item[]) =>
          arr.sort((a, b) => {
            return a.productId - b.productId;
          });

        const remainingItems = await updateItems(
          this.prisma,
          sortItems([...items]),
          sortItems([...prev]),
        );
        if (remainingItems.newItems?.length) {
          await this.prisma.itemsOnCart.createMany({
            data: remainingItems.newItems.map((i) => {
              return { ...i, shoppingCartId: id };
            }),
          });
        } else if (remainingItems.prevItems?.length) {
          const ids = remainingItems.prevItems.map((i) => i.id);
          await this.prisma.itemsOnCart.deleteMany({
            where: {
              id: { in: ids },
              shoppingCartId: id,
            },
          });
        }
        return HttpStatus.CREATED;
      }
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteCart(cartId: number) {
    try {
      await this.prisma.itemsOnCart.deleteMany({
        where: {
          shoppingCartId: cartId,
        },
      });

      await this.prisma.shoppingCart.delete({
        where: {
          id: cartId,
        },
      });

      return HttpStatus.ACCEPTED;
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
