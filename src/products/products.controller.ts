import { Controller, Query, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './products.dto';
import { Public } from 'src/auth/publicDecorator';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Public()
  @Get('all')
  async getAllProducts(): Promise<number> {
    return await this.productsService.getAllProducts();
  }

  @Public()
  @Get('pag')
  async getPaginatedProducts(
    @Query('take') take: number,
    @Query('skip') skip: number,
  ): Promise<Product[]> {
    return await this.productsService.getPaginatedProducts(take, skip);
  }

  @Public()
  @Get('detail/:id')
  async getOneProduct(@Param('id') id: number): Promise<Product> {
    return await this.productsService.getOneProduct(id);
  }

  @Public()
  @Get('categories')
  async getCategories(): Promise<String[]> {
    return await this.productsService.getCategories();
  }
}
