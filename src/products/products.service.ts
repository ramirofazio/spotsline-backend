import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product, RawProduct } from './products.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  productSelectOpt = {
    id: true,
    oferta: true,
    codpro: true,
    descri: true,
    color: true,
    precio1: true,
    precio2: true,
    precio3: true,
    precio4: true,
    precio5: true,
    precio6: true,
  };

  async getPaginatedProducts(take: number, skip: number): Promise<Product[]> {
    try {
      const products: RawProduct[] = await this.prisma.stock.findMany({
        take: take,
        skip: skip,
        where: { incluido: true },
        select: this.productSelectOpt,
      });

      if (!products) {
        throw new HttpException('products not found', HttpStatus.NOT_FOUND);
      }

      return products.map((p) => new Product(p));
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getOneProduct(id: number): Promise<Product> {
    try {
      const product = await this.prisma.stock.findFirst({
        where: { incluido: true, id: id },
        select: this.productSelectOpt,
      });

      if (!product) {
        throw new HttpException('product not found', HttpStatus.NOT_FOUND);
      }

      return new Product(product);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
