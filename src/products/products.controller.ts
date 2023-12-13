import { Controller, Query, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './products.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get('pag')
  async getPaginatedProducts(
    @Query('take') take: number,
    @Query('skip') skip: number,
  ): Promise<Product[]> {
    return await this.productsService.getPaginatedProducts(take, skip);
  }

  @Get('/:id')
  async getOneProduct(@Param('id') id: number): Promise<Product> {
    return await this.productsService.getOneProduct(id);
  }
}
