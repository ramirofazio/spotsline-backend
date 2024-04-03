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

@Controller('shopping-cart')
export class ShoppingCartController {
  constructor(private shoppingCartService: ShoppingCartService) {}

  @Post()
  async createCart(@Body() data: ShoppingCart): Promise<HttpStatus> {
    return await this.shoppingCartService.createCart(data);
  }
  @Put('edit/:userId')
  async updateCart(@Body() data: UpdateCart ): Promise<HttpStatus> {
    return await this.shoppingCartService.updateCart(data);
  }

  // @Get(':id')
  // findbyId(@Param('id') userId: string): Promise<Response> {
  //   return this.shoppingCartService.findById(userId);
  // }

  // @Delete(':id')
  // cleanCart(@Param('id') userId: string): Promise<string> {
  //   return this.shoppingCartService.cleanCart(userId);
  // }
}
