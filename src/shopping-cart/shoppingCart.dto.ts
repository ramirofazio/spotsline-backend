import { IsNotEmpty, IsNumber } from 'class-validator';
import { Decimal } from '@prisma/client/runtime/library';

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
  @IsNumber()
  discount?: number;

  @IsNotEmpty()
  total: number | Decimal;

  @IsNotEmpty()
  subtotal: number | Decimal;

  couponId?: number;
}

export class UpdateCart extends ShoppingCart {
  id: number;
}
