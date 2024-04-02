import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Product,
  Pagination,
  RawProduct,
  ProductProps,
  ProductVariant,
  RawVariantProduct,
  UpdateFeatured,
} from './products.dto';
import { MobbexItem, RequestItemDTO } from 'src/mobbex/mobbex.dto';

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
    pathfoto2: true,
  };

  async getOrderProductsData(items: RequestItemDTO[], userPriceList: number) {
    try {
      const cleanItemsAmount = await Promise.all(
        items.map(async ({ qty, id }) => {
          const item: RawVariantProduct =
            await this.prisma.stock.findFirstOrThrow({
              where: { id: id },
              select: this.productsSelectOpt,
            });
          if (item) {
            //? Accede dinamicamente a los precios de los productos dependiendo de la lista que tenga enlazada el Cliente
            const priceProperty = `precio${userPriceList}`;

            const totalItemsAmount = item[priceProperty] * qty;

            return Number(totalItemsAmount);
          }
        }),
      );

      //? Sumo el array de precios totales x productos para obtener el subtotal
      const subtotal = cleanItemsAmount.reduce((acc, num) => acc + num);

      return subtotal;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findCheckoutProducts(
    items: RequestItemDTO[],
    userPriceList: number,
  ): Promise<MobbexItem[]> {
    try {
      const cleanItems = Promise.all(
        items.map(async ({ qty, id }) => {
          const item: RawVariantProduct =
            await this.prisma.stock.findFirstOrThrow({
              where: { id: id },
              select: this.productsSelectOpt,
            });
          if (item) {
            //? Accede dinamicamente a los precios de los productos dependiendo de la lista que tenga enlazada el Cliente
            const priceProperty = `precio${userPriceList}`;

            const totalItemsAmount = item[priceProperty] * qty;

            return {
              description: item.descri.trim(),
              quantity: Number(qty),
              total: Number(totalItemsAmount),
              //! ACTUALIZAR
              image: 'imagen',
            };
          }
        }),
      );

      return cleanItems;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllProducts({
    page,
    take,
    search,
  }: {
    page: number;
    take: number;
    search: string;
  }): Promise<Pagination> {
    try {
      take = formatTake(take);
      page = formatPage(page);
      const skip = take * page - take;

      const where = {
        NOT: {
          codigo: 9999,
        },
      };

      const products: RawProduct[] = await this.prisma.marcas.findMany({
        take,
        skip,
        where,
        select: {
          codigo: true,
          descripcion: true,
        },
      });

      const rows: ProductProps[] = await Promise.all(
        products.map(async (marca) => {
          const product = await this.prisma.stock.findFirst({
            where: {
              marca: marca.codigo,
              incluido: true,
              NOT: {
                precio1: 0,
              },
            },
            select: {
              pathfoto2: true,
            },
          });

          if (!product) return null;

          return {
            id: marca.codigo,
            description: marca.descripcion,
            pathImage: product?.pathfoto2,
          };
        }),
      );
      const count = await this.prisma.marcas.count({ where });

      if (!products.length) {
        throw new HttpException(
          'productos no encontrados',
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        metadata: {
          total_pages: Math.ceil(count / take),
          total_items: count,
          items_per_page: take,
          current_page: page,
          search_term: search,
          next_page: Math.ceil(count / take) - page <= 0 ? null : page + 1,
        },
        rows: rows.filter((row) => row !== null),
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getFeaturedProdutcs(take: number) {
    const marcas: any[] = await this.prisma.marcas.findMany({
      where: {
        featured: true,
      },
    });
    if (!marcas.length) {
      throw new HttpException('productos no encontrados', HttpStatus.NOT_FOUND);
    }
    
    const featureProducts = await Promise.all(
      marcas.map(async (m) => {
        try {
          const firstProduct = await this.prisma.stock.findFirst({
            where: {
              marca: m.codigo,
            },
          });
          
          if (!firstProduct)
            throw new HttpException(
              'No ha y stock asociado a la marca',
              HttpStatus.NOT_FOUND,
            );

          const raw = {
            ...m,
            pathfoto: firstProduct.pathfoto2,
          };

          
          return raw;
        } catch (err) {
          console.log('La marca no tiene un producto asosciado', err);
        }
      }),
    );
    
    return featureProducts;
  }

  async editFeatured(body: UpdateFeatured): Promise<string> {
    const { id, featured } = body;

    try {
      const updated = await this.prisma.marcas.update({
        where: {
          id,
        },
        data: {
          featured,
        },
      });

      if (!updated) {
        throw new HttpException(
          `producto con id=${id}, no encontrado`,
          HttpStatus.NOT_FOUND,
        );
      }

      HttpStatus.ACCEPTED;
      return `Se actualizo el producto ${id} con featured=${featured}`;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getOneProduct(id: number): Promise<Product> {
    try {
      const marca = await this.prisma.marcas.findFirst({
        where: { codigo: id },
      });

      const rows = await this.prisma.stock.findMany({
        where: {
          marca: marca.codigo,
          incluido: true,
          NOT: {
            precio1: 0,
          },
        },
        select: this.productsSelectOpt,
      });
      if (!marca) {
        throw new HttpException('producto no encontrado', HttpStatus.NOT_FOUND);
      }

      const variants = await Promise.all(
        rows.map(async (variant) => {
          const [rubro, subRubro] = await this.prisma.$transaction([
            this.prisma.rubros.findFirst({
              where: { codigo: variant.rubro },
              select: { descri: true },
            }),
            this.prisma.subrub.findFirst({
              where: { codigo: variant.subrub },
              select: { descri: true },
            }),
          ]);

          return new ProductVariant(
            { ...variant },
            rubro?.descri,
            subRubro?.descri,
          );
        }),
      );
      return new Product({
        id: marca.codigo,
        description: marca.descripcion,
        variants: variants,
      });
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

const MAX_TAKE_PER_QUERY = 50;

const formatTake = (value: number): number => {
  let x = Number(value);
  if (x > MAX_TAKE_PER_QUERY || Number.isNaN(x)) {
    x = MAX_TAKE_PER_QUERY;
  }

  return x;
};

const formatPage = (value: number): number => Number(value) || 1;
