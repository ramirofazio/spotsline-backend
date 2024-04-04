import { IsNotEmpty, IsNumber } from 'class-validator';
import { Decimal } from '@prisma/client/runtime/library';
import { Coupon } from 'src/cupons/coupons.dto';

interface Item {
  id: number;
  name: string;
  img: string;
  productId: number;
  price: Decimal;
  quantity: number;
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

export class UpdateCart extends ShoppingCart {
  id: number;
}
