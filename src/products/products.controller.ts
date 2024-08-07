import {
  Controller,
  Query,
  Get,
  Param,
  Patch,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  Pagination,
  ProductProps,
  UpdateFeatured,
  FeaturedProduct,
  ProductVariantProps,
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
    @Query('order') order: string,
    @Query('category') category: string,
  ): Promise<Pagination> {
    return await this.productsService.getAllProducts({
      page,
      take,
      search,
      order,
      category,
    });
  }

  @Public()
  @Get('featured')
  async getFeaturedProducts(): Promise<FeaturedProduct[]> {
    return await this.productsService.getFeaturedProduts();
  }

  @Patch('edit_featured')
  async editFeatured(@Body() body: UpdateFeatured): Promise<string> {
    return await this.productsService.editFeatured(body);
  }

  @Patch('toggleIncluido')
  async toggleIncluido(
    @Query('productCode') productCode: string,
  ): Promise<HttpStatus> {
    return await this.productsService.toggleIncluido(productCode);
  }

  @Public() // ? esto deberia ser publico?
  @Get('/dashboard-products')
  async getDashboardProducts(
    @Query('page') page: number,
  ): Promise<ProductProps[] | any> {
    return await this.productsService.getDashboardProducts();
  }

  @Public() // ? esto deberia ser publico?
  @Get('/dashboard-product-variants')
  async getDashboardProductVariant(
    @Query('productCode') productCode: number,
  ): Promise<ProductVariantProps[]> {
    return await this.productsService.getDashboardProductVariants(productCode);
  }

  @Public()
  @Get('detail/:id')
  async getOneProduct(@Param('id') id: number): Promise<ProductProps> {
    return await this.productsService.getOneProduct(id);
  }

  @Public()
  @Get('categories')
  async getCategories(): Promise<{ name: string; value: number }[]> {
    return await this.productsService.getCategories();
  }
}
