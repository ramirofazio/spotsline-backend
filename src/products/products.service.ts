import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Product, RawProduct, Pagination } from './products.dto';
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
    pathfoto: true,
  };

  async getOrderProductsData(items: RequestItemDTO[], userPriceList: number) {
    try {
      const cleanItemsAmount = await Promise.all(
        items.map(async ({ qty, id }) => {
          const item: RawProduct = await this.prisma.stock.findFirstOrThrow({
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
          const item: RawProduct = await this.prisma.stock.findFirstOrThrow({
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
      const where =
        search !== 'null'
          ? {
              descri: {
                contains: search,
              },
              incluido: true,
            }
          : { incluido: true };

      const products: RawProduct[] = await this.prisma.stock.findMany({
        take,
        skip,
        where,
        select: this.productsSelectOpt,
      });

      const count = await this.prisma.stock.count({ where });

      if (!products.length) {
        throw new HttpException(
          'productos no encontrados',
          HttpStatus.NOT_FOUND,
        );
      }

      // TODO modularizar servicio para parsear los productos
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

      return {
        metadata: {
          total_pages: Math.ceil(count / take),
          total_items: count,
          items_per_page: take,
          current_page: page,
          search_term: search,
          next_page: Math.ceil(count / take) - page <= 0 ? null : page + 1,
        },
        rows: cleanProducts.filter((product) => product !== null),
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

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
          'productos no encontrados',
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

  async getFeaturedProdutcs(take: number) {
    const products: RawProduct[] = await this.prisma.stock.findMany({
      take: take,
      where: { 
        incluido: true,
        featured: true, 
        pathfoto: { not: '' } // ? Cuando esten cargadas als imagenes de s3 cambiar a "pathfoto2"
      },
      select: {...this.productsSelectOpt, featured: true},
    });

    if (!products.length) {
      throw new HttpException('productos no encontrados', HttpStatus.NOT_FOUND);
    }

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

        return new Product(p, rubro.descri, subRubro.descri, marca.descripcion);
      }),
    );
    return cleanProducts;
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

const MAX_TAKE_PER_QUERY = 50;

const formatTake = (value: number): number => {
  let x = Number(value);
  if (x > MAX_TAKE_PER_QUERY || Number.isNaN(x)) {
    x = MAX_TAKE_PER_QUERY;
  }

  return x;
};

const formatPage = (value: number): number => Number(value) || 1;
