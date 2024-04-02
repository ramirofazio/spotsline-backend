import { Controller, Query, Get, Param, Put, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  Pagination,
  Product,
  ProductProps,
  UpdateFeatured,
} from './products.dto';
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

    /* @Public()
  @Get('featured')
  async getFeaturedProducts(
    @Query('take') take: number,
  ): Promise<Product[]> {
    return await this.productsService.getFeaturedProdutcs(take);
  } */

  @Public()
  @Put('edit_featured')
  async editFeatured(@Body() body: UpdateFeatured): Promise<string> {
    return await this.productsService.editFeatured(body);
  }

  @Public()
  @Get('detail/:id')
  async getOneProduct(@Param('id') id: number): Promise<ProductProps> {
    return await this.productsService.getOneProduct(id);
  }

  @Public()
  @Get('categories')
  async getCategories(): Promise<String[]> {
    return await this.productsService.getCategories();
  }
}
