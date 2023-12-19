import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product, RawProduct } from './products.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  productsSelectOpt = {
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
    rubro: true,
    subrub: true,
    marca: true,
  };

  async getPaginatedProducts(take: number, skip: number): Promise<Product[]> {
    try {
      const products: RawProduct[] = await this.prisma.stock.findMany({
        take: take,
        skip: skip,
        where: { incluido: true },
        select: this.productsSelectOpt,
      });

      if (!products.length) {
        // Cambiado de !products a !products.length para verificar array vacío
        throw new HttpException(
          'productos no encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      // Utiliza Promise.all para esperar a que todas las promesas se resuelvan
      const cleanProducts: Product[] = await Promise.all(
        products.map(async (p) => {
          const [rubro, subRubro, marca] = await this.prisma.$transaction([
            this.prisma.rubros.findFirst({
              where: { codigo: p.rubro },
              select: { descri: true },
            }),
            this.prisma.subrub.findFirst({
              where: { codigo: p.subrub },
              select: { descri: true },
            }),
            this.prisma.marcas.findFirst({
              where: { codigo: p.marca },
              select: { descripcion: true },
            }),
          ]);

          if (!rubro || !subRubro || !marca) {
            console.error('Datos de producto incompletos');
            return null;
          }

          return new Product(
            p,
            rubro.descri,
            subRubro.descri,
            marca.descripcion,
          );
        }),
      );

      return cleanProducts.filter((product) => product !== null); //? Devuelvo los que tengan el contenido necesario, los demas los salteo
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getOneProduct(id: number): Promise<Product> {
    try {
      const product = await this.prisma.stock.findFirst({
        where: { id: id, incluido: true },
        select: this.productsSelectOpt,
      });

      if (!product) {
        throw new HttpException('producto no encontrado', HttpStatus.NOT_FOUND);
      }

      const [rubro, subRubro, marca] = await this.prisma.$transaction([
        this.prisma.rubros.findFirst({
          where: { codigo: product.rubro },
          select: { descri: true },
        }),
        this.prisma.subrub.findFirst({
          where: { codigo: product.subrub },
          select: { descri: true },
        }),
        this.prisma.marcas.findFirst({
          where: { codigo: product.marca },
          select: { descripcion: true },
        }),
      ]);

      if (!rubro || !subRubro || !marca) {
        throw new HttpException(
          'Datos de producto incompletos',
          HttpStatus.NOT_FOUND,
        );
      }

      return new Product(
        product,
        rubro.descri,
        subRubro.descri,
        marca.descripcion,
      );
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const categories = await this.prisma.rubros.findMany({
        select: { descri: true },
        where: { mostrarweb: true },
      });

      return categories.map((c) => c.descri.trim());
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
