import { Controller, Query, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Pagination, Product } from './products.dto';
import { Public } from 'src/auth/publicDecorator';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Public()
  @Get('')
  async getAllProducts(
    @Query('page') page: number,
    @Query('take') take: number,
    @Query('search') search: string,
  ): Promise<Pagination> {
    return await this.productsService.getAllProducts({ page, take, search });
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
  async getOneProduct(
    @Param('id') id: number,
  ): Promise<{ codigo: number; description: string; variants: Product[] }> {
    return await this.productsService.getOneProduct(id);
  }

  @Public()
  @Get('categories')
  async getCategories(): Promise<String[]> {
    return await this.productsService.getCategories();
  }
}
