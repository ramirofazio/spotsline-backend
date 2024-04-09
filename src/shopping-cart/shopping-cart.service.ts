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
          id: true,
          productId: true,
          qty: true,
          name: true,
          price: true,
          img: true,
        },
      });
      console.log('prev', prevItems);

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
        console.log('no hay itmes');
        // * Si el cart esta vacio borra los items previos
        await this.prisma.itemsOnCart.deleteMany({
          where: { shoppingCartId: id },
        });
        return HttpStatus.OK;
      } else {
        console.log('entro en el void');
        async function updateItems() {
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
            console.log('for1 index :' + index);
            for (
              let prevIndex = index;
              prevIndex < prevItems.length;
              prevIndex++
            ) {
              console.log('for2 index :' + prevIndex);
              const prevId = prevItems[prevIndex]?.productId;

              if (newId !== prevId) {
                if (newId < prevId) {
                  console.log('AGREGA', newId);
                  await this.prisma.itemsOnCart.create({
                    data: { ...itm, shoppingCartId: id },
                  });
                  continue;
                } else if (newId > prevId) {
                  console.log('SACA', prevId);
                  await this.prisma.itemsOnCart.deleteMany({
                    where: {
                      shoppingCartId: id,
                      id: prevId,
                    },
                  });
                  return;
                }
              } else if (newId === prevId) {
                console.log('ACTUALUIZA MISMO ID');
                const last = await this.prisma.itemsOnCart.update({
                  where: {
                    id: prevItems[prevIndex].id,
                    shoppingCartId: id,
                  },
                  data: itm,
                });
                console.log(prevItems[prevIndex].id);
                console.log('ultimo', last);
                return;
              }
            }
          }
        }
        updateItems() // pasar await de bucle a Promise.all
        return HttpStatus.CREATED;
      }
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
