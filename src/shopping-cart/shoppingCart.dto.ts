import { IsNotEmpty, IsNumber } from 'class-validator';

interface ProductsOnCart {
  qty: number;
  productId: number;
  price: number;
}

export class ShoppingCartDTO {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  shoppingCart: ProductsOnCart[];

  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;
}
