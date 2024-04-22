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
  ProductVariantProps,
  GetProducts,
} from './products.dto';
import { MobbexItem, RequestItemDTO } from 'src/mobbex/mobbex.dto';
import { formatPage, formatTake } from 'src/utils/pagination';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

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
    incluido: true,
    ivagrupo: true,
    unimed: true,
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
  }: GetProducts): Promise<Pagination> {
    try {
      console.log('entro');
      take = formatTake(take);
      page = formatPage(page);
      const skip = take * page - take;

      const where = {
        NOT: {
          codigo: 9999,
        },
        descripcion: {
          contains: search === 'null' ? '' : search,
        },
      };

      const products: RawProduct[] | any[] = await this.prisma.marcas.findMany({
        take,
        skip,
        where,
        select: {
          codigo: true,
          descripcion: true,
          featured: true,
        },
      });

      const rows: ProductProps[] = await Promise.all(
        products.map(async (marca: any) => {
          const product = await this.prisma.stock.findFirst({
            where: {
              marca: marca.codigo,
              incluido: true,
              NOT: {
                precio1: 0,
                precio2: 0,
                precio3: 0,
                precio4: 0,
                precio5: 0,
                precio6: 0,
              },
            },
            select: {
              id: true,
              pathfoto2: true,
              precio1: true,
            },
          });

          if (!product) return null;

          return {
            codigo: marca.codigo,
            description: marca.descripcion,
            featured: marca.featured,
            pathImage: product?.pathfoto2,
            precio: product.precio1,
            id: product.id,
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

  async getFilteredProducts({ order }): Promise<any> {
    try {
      const take = 28;
      let orderQuery = {};
      if (order) {
        orderQuery = {
          orderBy: {
            precio1: order,
          },
        };
      }
      let search = '';
      const where = {
        NOT: {
          codigo: 9999,
        },
        descripcion: {
          contains: search === 'null' ? '' : search,
        },
      };

      const products = await this.prisma.marcas.findMany({
        where,
        select: {
          codigo: true,
        },
      });
      const marcas = products.map((p) => p.codigo);

      const stock = await this.prisma.stock.findMany({
        // ? UNa marca por stock?
        where: {
          incluido: true,
          precio1: {
            not: 0,
            gte: 0.01,
          },
          precio2: {
            not: 0,
            gte: 0.01,
          },
          precio3: {
            not: 0,
            gte: 0.01,
          },
          precio4: {
            not: 0,
            gte: 0.01,
          },
          precio5: {
            not: 0,
            gte: 0.01,
          },
          marca: {
            not: 9999,
            in: marcas,
          },
        },
        select: {
          id: true,
          pathfoto2: true,
          precio1: true,
          marca: true,
        },
        ...orderQuery,
      });
      console.log(stock.length);
      const count = stock.length;
      const page = 1;
      return {
        metadata: {
          total_pages: Math.ceil(stock.length / take),
          total_items: stock.length,
          items_per_page: take,
          current_page: page,
          // search_term: search,
          next_page: Math.ceil(count / take) - page <= 0 ? null : page + 1,
        },
        rows: stock,
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
      if (featured === true) {
        const featuredArray: { featured: boolean }[] =
          await this.prisma.marcas.findMany({
            select: { featured: true },
          });

        const validateFive = featuredArray.filter((el) => el.featured === true);

        if (validateFive.length > 4) {
          throw new HttpException(
            'Ya existen 5 productos destacados',
            HttpStatus.CONFLICT,
          );
        }
      }

      const marca = await this.prisma.marcas.findFirst({
        where: { codigo: id },
      });

      const updated = await this.prisma.marcas.update({
        where: {
          id: marca.id,
        },
        data: {
          featured: featured,
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

      if (!marca || !rows) {
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

      if (variants.length === 0) {
        throw new HttpException(
          'el producto no cumple todas las condiciones',
          HttpStatus.EXPECTATION_FAILED,
        );
      }

      return new Product({
        codigo: marca.codigo,
        description: marca.descripcion,
        featured: marca.featured,
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
        //TODO ARREGLAR ESTO PARA PRODUCCION
        //where: { mostrarweb: true },
      });

      return categories.map((c) => c.descri.trim());
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDashboardProducts(page: number): Promise<Product[] | any> {
    try {
      const take = 50;
      page = formatPage(page);
      const skip = take * page - take;

      const marcas = await this.prisma.marcas.findMany({ take, skip });

      if (!marcas || marcas.length === 0) {
        throw new HttpException(
          'No se encontraron productos',
          HttpStatus.NOT_FOUND,
        );
      }

      const products = await Promise.all(
        marcas.map(async (marca) => {
          const rows = await this.prisma.stock.findMany({
            where: {
              marca: marca.codigo,
              NOT: {
                precio1: 0,
              },
            },
            select: this.productsSelectOpt,
            orderBy: { incluido: 'desc' },
          });

          if (!rows || rows.length === 0) {
            return null;
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

          if (variants.length === 0) {
            throw new HttpException(
              `El producto con ID ${marca.codigo} no cumple todas las condiciones`,
              HttpStatus.EXPECTATION_FAILED,
            );
          }

          return new Product({
            codigo: marca.codigo,
            description: marca.descripcion,
            featured: marca.featured,
            variants: variants,
          });
        }),
      );

      return products.filter((p) => p !== null);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDashboardProductVariants(
    productCode: number,
  ): Promise<ProductVariantProps[]> {
    try {
      const rows = await this.prisma.stock.findMany({
        where: {
          marca: productCode,
          NOT: {
            precio1: 0,
          },
        },
        select: this.productsSelectOpt,
        orderBy: { incluido: 'desc' },
      });

      if (!rows || rows.length === 0) {
        return null;
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

      if (variants.length === 0) {
        throw new HttpException(
          `El producto con ID ${productCode} no cumple todas las condiciones`,
          HttpStatus.EXPECTATION_FAILED,
        );
      }

      return variants;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async toggleIncluido(productCode: string): Promise<HttpStatus> {
    try {
      const variant = await this.prisma.stock.findFirst({
        where: { codpro: productCode },
      });

      if (!variant) {
        throw new HttpException('Variante no encontrada', HttpStatus.NOT_FOUND);
      }

      await this.prisma.stock.update({
        where: { codpro: productCode },
        data: { incluido: !variant.incluido },
      });

      return HttpStatus.OK;
    } catch (e) {
      console;
    }
  }
}
