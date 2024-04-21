import {
  Controller,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Post,
  HttpStatus,
} from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { ShoppingCart } from './shoppingCart.dto';

@Controller('shopping-cart')
export class ShoppingCartController {
  constructor(private shoppingCartService: ShoppingCartService) {}

  @Post()
  async createCart(@Body() data: ShoppingCart | any): Promise<HttpStatus> {
    return await this.shoppingCartService.createCart(data);
  }

  @Put('update')
  async updateCart(@Body() data: ShoppingCart | any): Promise<HttpStatus> {
    return await this.shoppingCartService.updateCart(data);
  }

  @Delete('delete/:cartId')
  async deleteCart(
    @Param('cartId') cartId: number,
    @Query('force') force?: boolean,
  ): Promise<HttpStatus> {
    return await this.shoppingCartService.deleteCart(cartId, force);
  }
}
