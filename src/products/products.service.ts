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
  FeaturedProduct,
} from './products.dto';
import { MobbexItem, RequestItemDTO } from 'src/mobbex/mobbex.dto';
import { formatPage, formatTake } from 'src/utils/pagination';
import { marcas } from '@prisma/client';

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
    usoart: true,
  };

  async getOrderProductsData(items: RequestItemDTO[], userPriceList: number) {
    try {
      const cleanItemsAmount = await Promise.all(
        items.map(async ({ qty, productId }) => {
          const item: RawVariantProduct =
            await this.prisma.stock.findFirstOrThrow({
              where: { id: productId },
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
        items.map(async ({ qty, productId }) => {
          const item: RawVariantProduct =
            await this.prisma.stock.findFirstOrThrow({
              where: { id: productId },
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
              image: item.pathfoto2,
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
    order,
    category,
  }: {
    page: number;
    take: number;
    search: string;
    order: string;
    category: string;
  }): Promise<Pagination | any> {
    try {
      take = formatTake(take);
      page = formatPage(page);
      const skip = take * page - take;
      const pricesRequired = {
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
      };
      const where = {
        OR: [
          {
            ...pricesRequired,
            pathfoto2: {
              contains: 'spotsline-bucket',
            },
          },
          {
            ...pricesRequired,
          },
        ],
      };

      if (category) {
        where.OR[0]['rubro'] = parseInt(category);
        where.OR[1]['rubro'] = parseInt(category);
      }

      const stock = await this.prisma.stock.findMany({
        where: where,
        select: {
          marca: true,
          pathfoto2: true,
          rubro: true,
          precio1: true,
          usoart: true,
        },
      });

      // * Se deja 1 stock por Marca
      let isAlready = {};
      const uniqueStock = [];

      stock.map((s) => {
        if (!isAlready[Number(s.marca)]) {
          isAlready[Number(s.marca)] = {
            pathfoto: [s.pathfoto2],
            marca: s.marca,
            price: s.precio1, // ? se maneja todo el orden por el precio1
          };
          return uniqueStock.push(s);
        } else {
          isAlready[Number(s.marca)].pathfoto.push(s.pathfoto2);
        }
      });

      const mappedMarcas = Object.keys(isAlready);

      const products: RawProduct[] | any[] = await this.prisma.marcas.findMany({
        take,
        skip,
        where: {
          codigo: { in: mappedMarcas },
          NOT: {
            codigo: 9999,
          },
          descripcion: {
            contains: search,
          },
        },
        select: {
          codigo: true,
          descripcion: true,
          featured: true,
        },
      });

      let addPathfoto = products.map(
        ({ codigo, descripcion, featured }: any) => {
          const pathfotos = isAlready[Number(codigo)]?.pathfoto;
          const price = isAlready[Number(codigo)]?.price;
          return {
            codigo,
            featured,
            pathfoto: pathfotos || '',
            price,
            description: descripcion.trim(),
          };
        },
      );

      const count = uniqueStock.length;

      // * Se hace el ordenamiento aca y no en prisma
      function sortStock(order: string, stockArr: any) {
        const sortedStock = stockArr.sort((stock1, stock2) => {
          const price1 = parseFloat(stock1.price);
          const price2 = parseFloat(stock2.price);

          if (order === 'asc') {
            return price1 - price2;
          } else if (order === 'desc') {
            return price2 - price1;
          }
          return 0;
        });
        return sortedStock;
      }

      if (order) {
        sortStock(order, addPathfoto);
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
        rows: addPathfoto,
      };
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getFeaturedProduts(): Promise<FeaturedProduct[]> {
    const marcas: marcas[] = await this.prisma.marcas.findMany({
      where: {
        featured: true,
      },
    });

    if (!marcas.length) {
      throw new HttpException('productos no encontrados', HttpStatus.NOT_FOUND);
    }

    const featuredProducts = await Promise.all(
      marcas.map(async (marca) => {
        try {
          //? Me traigo las fotos de las variantes que cumplan las condiciones del where
          const variants: { pathfoto2: string }[] =
            await this.prisma.stock.findMany({
              where: {
                marca: marca.codigo,
                incluido: true,
                pathfoto2: {
                  contains: 'spotsline-bucket',
                },
                NOT: { precio1: 0 },
              },
              select: {
                pathfoto2: true,
                usoart: true,
              },
            });

          if (!variants.length) {
            return null;
          }

          return new FeaturedProduct({
            ...marca,
            variants,
          });
        } catch (err) {
          console.log('La marca no tiene variantes asosciadas', err);
        }
      }),
    );

    return featuredProducts.filter((item) => item !== null);
  }

  async editFeatured(body: UpdateFeatured): Promise<string> {
    const { id, featured } = body;

    try {
      if (featured === true) {
        const featuredArray: { featured: boolean }[] =
          await this.prisma.marcas.findMany({
            select: { featured: true },
          });

        const validateMax = featuredArray.filter((el) => el.featured === true);

        if (validateMax.length > 9) {
          throw new HttpException(
            'Ya existen 10 productos destacados',
            HttpStatus.CONFLICT,
          );
        }
      }

      const marca = await this.prisma.marcas.findFirst({
        where: { codigo: id },
      });

      const hasPhoto = await this.prisma.stock.findFirst({
        where: {
          incluido: true,
          marca: marca.codigo,
          pathfoto2: {
            contains: 'https://spotsline-bucket.s3.amazonaws.com',
          },
        },
        select: {
          codpro: true,
          pathfoto2: true,
        },
      });
      if (!hasPhoto) {
        throw new HttpException(
          'Agregue una foto a alguna variante activa de este producto',
          HttpStatus.CONFLICT,
        );
      }

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

  async getCategories(): Promise<{ name: string; value: number }[]> {
    try {
      const categories = await this.prisma.rubros.findMany({
        select: { descri: true, codigo: true },
        //TODO ARREGLAR ESTO PARA PRODUCCION
        where: { mostrarweb: true },
      });

      return categories.map((c) => {
        return { name: c.descri.trim(), value: c.codigo };
      });
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //TODO REVISAR ESTO QUE SE LE SACO EL PAGE
  async getDashboardProducts(): Promise<Product[] | any> {
    try {
      const marcas = await this.prisma.marcas.findMany({
        orderBy: [{ featured: 'desc' }, { descripcion: 'asc' }],
      });

      if (!marcas || marcas.length === 0) {
        throw new HttpException(
          'No se encontraron productos',
          HttpStatus.NOT_FOUND,
        );
      }

      const products = await Promise.all(
        marcas.map(async (marca) => {
          //! VER ESTO. OJOOOOOOOOOOO. ESTA PORQUE ESTA MARCA TIENE 95 VARIANTES Y REVIENTA TODO XDDD
          if (marca.descripcion.trim() === '400') {
            return null;
          }

          const rows = await this.prisma.stock.findMany({
            where: {
              marca: marca.codigo,
              NOT: {
                precio1: 0,
              },
            },
            select: this.productsSelectOpt,
            orderBy: [{ incluido: 'desc' }, { descri: 'asc' }],
          });

          if (!rows || rows.length === 0) {
            return null;
          }

          const variants = await Promise.all(
            rows.map(async (variant) => {
              const rubro = await this.prisma.rubros.findFirst({
                where: { codigo: variant.rubro },
                select: { descri: true },
              });
              const subRubro = await this.prisma.subrub.findFirst({
                where: { codigo: variant.subrub },
                select: { descri: true },
              });

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

          const isActive = variants.some((variant) => variant.incluido);

          return {
            producto: new Product({
              codigo: marca.codigo,
              description: marca.descripcion,
              featured: marca.featured,
              variants: variants,
            }),
            activo: isActive,
          };
        }),
      );

      // Filtrar los productos nulos y ordenar por activos e inactivos
      const validProducts = products.filter((p) => p !== null);
      validProducts.sort((a, b) => (b.activo ? 1 : 0) - (a.activo ? 1 : 0));

      // Map back to the product objects without the 'activo' property
      return validProducts.map((p) => p.producto);
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
        orderBy: [{ incluido: 'desc' }, { descri: 'asc' }],
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
      console.log(e);
    }
  }
}
