import { Controller, Put, Delete, Get, Body, Param } from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { ShoppingCartDTO } from './shoppingCart.dto';

@Controller('shopping-cart')
export class ShoppingCartController {
  constructor(private shoppingCartService: ShoppingCartService) {}

  //   @Put()
  //   async updateCart(@Body() data: ShoppingCartDTO): Promise<ShoppingCartDTO> {
  //     return await this.shoppingCartService.loadCart(data);
  //   }

  //   @Get(':id')
  //   findbyId(@Param('id') userId: string): Promise<Response> {
  //     return this.shoppingCartService.findById(userId);
  //   }

  //   @Delete(':id')
  //   cleanCart(@Param('id') userId: string): Promise<string> {
  //     return this.shoppingCartService.cleanCart(userId);
  //   }
}
