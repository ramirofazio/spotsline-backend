import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShoppingCart, Item } from './shoppingCart.dto';

@Injectable()
export class ShoppingCartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: number) {
    try {
      const cart = await this.prisma.shoppingCart.findFirst({
        where: {
          userId: userId,
        },
      });

      if (!cart) {
        return null;
      }

      const rawItems = await this.prisma.web_itemsOnCart.findMany({
        where: {
          shoppingCartId: cart.id,
        },
      });

      if (cart.couponId) {
        const coupon = await this.prisma.coupons.findFirst({
          where: {
            id: cart.couponId,
          },
        });

        return new ShoppingCart({
          ...cart,
          userId,
          coupon: coupon,
          items: rawItems.map((item) => new Item(item)),
        });
      }

      return new ShoppingCart({
        ...cart,
        userId,
        discount: 0,
        coupon: false,
        items: rawItems.map((item) => new Item(item)),
      });
    } catch (err) {
      console.log(err);
      throw new HttpException(
        'Get cart failed',
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
        await tx.web_itemsOnCart.createMany({
          data: items.map((i: Item) => {
            return { ...new Item(i), shoppingCartId: cart.id };
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
  }: ShoppingCart) {
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

      const prevItems = await this.prisma.web_itemsOnCart.findMany({
        where: { shoppingCartId: id },
        select: {
          id: true,
          productId: true,
          qty: true,
          itemName: true,
          price: true,
          img: true,
        },
      });

      if (prevItems.length === 0 && items.length > 0) {
        //? si hay items y no hay items previos los crea
        items.map(async (i) => {
          const cleanItem = new Item(i);

          return await this.prisma.web_itemsOnCart.create({
            data: { ...cleanItem, shoppingCartId: id },
          });
        });

        return HttpStatus.OK;
      } else if (items.length === 0) {
        //? si no hay items borra los previos
        await this.prisma.web_itemsOnCart.deleteMany({
          where: { shoppingCartId: id },
        });

        return HttpStatus.OK;
      } else {
        async function updateItems(prisma: PrismaService, newItems, prevItems) {
          // Array para almacenar los IDs de los elementos que deben eliminarse
          const itemsToDelete = [];

          for (const prevItem of prevItems) {
            // Verificar si el elemento previo está presente en newItems
            const existsInNewItems = newItems.some(
              (newItem) => newItem.productId === prevItem.productId,
            );

            if (!existsInNewItems) {
              // El elemento previo no está en newItems, agregar su ID a itemsToDelete
              itemsToDelete.push(prevItem.id);
            } else {
              // El elemento previo está en newItems, actualizar su qty si es necesario
              const newItem = newItems.find(
                (item) => item.productId === prevItem.productId,
              );
              if (newItem.qty !== prevItem.qty) {
                await prisma.web_itemsOnCart.update({
                  where: { id: prevItem.id },
                  data: { qty: newItem.qty },
                });
              }
            }
          }

          // Eliminar los elementos que deben ser borrados
          if (itemsToDelete.length > 0) {
            await prisma.web_itemsOnCart.deleteMany({
              where: { id: { in: itemsToDelete } },
            });
          }

          // Crear los elementos nuevos que no estaban en prevItems
          const newItemsToAdd = newItems.filter(
            (newItem) =>
              !prevItems.some(
                (prevItem) => prevItem.productId === newItem.productId,
              ),
          );
          for (const newItem of newItemsToAdd) {
            const cleanItem = new Item(newItem);
            await prisma.web_itemsOnCart.create({
              data: { ...cleanItem, shoppingCartId: id },
            });
          }
        }

        await updateItems(this.prisma, items, prevItems);

        return HttpStatus.CREATED;
      }
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteCart(cartId: number, force?: boolean) {
    try {
      await this.prisma.web_itemsOnCart.deleteMany({
        where: {
          shoppingCartId: cartId,
        },
      });

      if (force) {
        await this.prisma.shoppingCart.delete({
          where: {
            id: cartId,
          },
        });
        return HttpStatus.ACCEPTED;
      } else {
        await this.prisma.shoppingCart.update({
          where: {
            id: cartId,
          },
          data: {
            discount: 0,
            total: 0,
            subtotal: 0,
            couponId: null,
          },
        });
        return HttpStatus.OK;
      }
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
