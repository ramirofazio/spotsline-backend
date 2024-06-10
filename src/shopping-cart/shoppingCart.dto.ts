import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';
import { Coupon } from 'src/cupons/coupons.dto';

export class Item {
  productId: number;
  marcaId: number;
  qty: number;
  itemName: string;
  img: string;
  price: number;

  constructor({ productId, qty, itemName, img, price, marcaId }) {
    this.productId = productId;
    this.qty = qty;
    this.itemName = itemName;
    this.img = img;
    this.marcaId = marcaId;
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
