import { IsNotEmpty, IsNumber } from 'class-validator';
import { Decimal } from '@prisma/client/runtime/library';
import { Coupon } from 'src/cupons/coupons.dto';

export interface Item {
  productId: number;
  qty: number;
  name: string;
  img: string;
  price: Decimal; //Dejar decimal cuanod no se use mockup
}

export interface ShoppingCart {
  userId: number;

  discount: number;

  total: number | Decimal;

  subtotal: number | Decimal;

  items: Item[];

  coupon: Coupon | false;
}

export interface UpdateCart extends ShoppingCart {
  id: number;
}

export interface PrevItems extends Item {
  shoppingCartId: number;
}
