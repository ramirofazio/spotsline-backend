import { IsNotEmpty, IsNumber } from 'class-validator';
import { Decimal } from '@prisma/client/runtime/library';
import { Coupon } from 'src/cupons/coupons.dto';

export interface Item {
  name: string;
  img: string;
  productId: number;
  price: Decimal;
  qty: number;
}
export interface PrevItems extends Item {
  shoppingCartId: number;
}

export class ShoppingCart {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  items?: Item[];

  @IsNotEmpty()
  total: number | Decimal;

  @IsNotEmpty()
  subtotal: number | Decimal;

  @IsNumber()
  discount?: number;

  coupon?: Coupon;
}

export interface UpdateCart extends ShoppingCart {
  id: number;
}

