import { Decimal } from '@prisma/client/runtime/library';
import { Coupon } from 'src/cupons/coupons.dto';

export class Item {
  productId: number;
  qty: number;
  name: string;
  img: string;
  price: Decimal; //Dejar decimal cuanod no se use mockup

  constructor({ productId, qty, name, img, price }) {
    this.productId = productId;
    this.qty = qty;
    this.name = name;
    this.img = img;
    this.price = price;
  }
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
