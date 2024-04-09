import {
  Controller,
  Put,
  Delete,
  Get,
  Body,
  Param,
  Post,
  HttpStatus,
} from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { ShoppingCart, UpdateCart } from './shoppingCart.dto';
import { Public } from 'src/auth/publicDecorator';

@Controller('shopping-cart')
export class ShoppingCartController {
  constructor(private shoppingCartService: ShoppingCartService) {}

  @Post()
  async createCart(@Body() data: ShoppingCart): Promise<HttpStatus> {
    return await this.shoppingCartService.createCart(data);
  }
  @Public()
  @Put('update')
  async updateCart(@Body() data: UpdateCart): Promise<HttpStatus> {
    return await this.shoppingCartService.updateCart(data);
  }

  @Delete('delete/:cartId')
  async deleteCart(@Param('cartId') cartId: number): Promise<HttpStatus> {
    return await this.shoppingCartService.deleteCart(cartId);
  }
}
