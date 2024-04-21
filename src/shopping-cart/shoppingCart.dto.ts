import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';
import { Coupon } from 'src/cupons/coupons.dto';

export class Item {
  productId: number;
  qty: number;
  name: string;
  img: string;
  price: number;

  constructor({ productId, qty, name, img, price }) {
    this.productId = productId;
    this.qty = qty;
    this.name = name;
    this.img = img;
    this.price = Number(price);
  }
}

export class ShoppingCart {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  discount: number;

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @IsNotEmpty()
  @IsNumber()
  subtotal: number;

  @IsNotEmpty()
  @IsArray()
  items: Item[] | [];

  coupon?: Coupon | false;

  constructor({ id, userId, discount, total, subtotal, items, coupon }) {
    this.id = id;
    this.userId = userId;
    this.discount = discount;
    this.total = Number(total);
    this.subtotal = Number(subtotal);
    this.items = items.map((item) => new Item(item));
    this.coupon = coupon;
  }
}

export interface PrevItems extends Item {
  shoppingCartId: number;
}
