import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewOrder } from './orders.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { RawClient } from 'src/clients/clients.dto';
import { RequestItemDTO } from 'src/mobbex/mobbex.dto';
import { RawVariantProduct } from 'src/products/products.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async getOrders() {
    try {
      const orders = await this.prisma.web_orders.findMany({
        select: {
          id: true,
          userId: true,
          email: true,
          orderName: true,
          total: true,
          subtotal: true,
          discount: true,
          date: true,
        },
      });
      return orders;
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createSystemOrder(newOrder: NewOrder, items: RequestItemDTO[]) {
    try {
      //? Consigo datos necesarios para la cabecera del pedido
      let OrderNumber;

      if (newOrder.email !== 'user@spotsline.com.ar') {
        //? Cuando no es una orden de prueba del usuario spot creo el numero de orden
        OrderNumber = await this.getOrderNumber();
      }

      const {
        nrocli,
        razsoc,
        codven,
        condicion,
        cond_vta,
        expreso,
        lista,
        locali,
        direcc,
      }: RawClient = await this.getClientData(newOrder.userId);
      const seller = await this.prisma.vende.findFirst({
        where: { codven: codven },
      });

      //? Creo la cabecera de la orden en la tabla `pedidoCab`
      const pedidoCab = await this.prisma.pedidoCab.create({
        data: {
          // TODO agregar cupon Id & Discount
          empresaid: 1,
          tipodocid: 10007,
          tipodoc: 'PD',
          letra: 'X',
          punto: 5,
          nroped: OrderNumber || 99999,
          fechaing: new Date().toISOString(),
          parafecha: newOrder.deliveryDate,
          nrocli: nrocli,
          razsoc: razsoc,
          codven: codven,
          condicion: condicion,
          cond_vta: cond_vta,
          viaid: 6,
          via: 'WEB',
          sucursal: 'CENTRAL',
          nrotra: expreso,
          usuario: seller?.nombre || 'WEB',
          usuarioid: 0,
          lisfac: lista,
          TotalNet: newOrder.total,
          monfac: 'PES',
          direcc: direcc,
          localiid: locali,
        },
      });

      await this.prisma.web_orders.update({
        where: {
          id: newOrder.id,
          type: { not: 'TEMPORAL' },
        },
        data: {
          cabeceraid: pedidoCab.id,
        },
      });

      if (!pedidoCab) {
        throw new HttpException(
          'no se pudo crear la cabecera del pedido',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      //? Recorro los items de la orden realizada
      items.map(async (item, index) => {
        //? Consigo datos necesarios para el detalle del pedido
        const variant: RawVariantProduct = await this.getItemData(
          item.productId,
        );
        const priceProperty = `precio${lista}`;
        const ivaPorc = await this.getIva(item.productId);

        //? Creo el detalle de la orden en la tabla `pedidoDet`
        await this.prisma.pedidoDet.create({
          data: {
            canasoc: 0,
            cabeceraid: pedidoCab.id,
            item: index,
            articulo: variant.codpro,
            descri: variant.descri,
            cantidad: item.qty,
            pendientes: 0,
            preparado: 0,
            precio: variant[priceProperty],
            precorig: variant[priceProperty],
            bonif: 0,
            bonif1: 0,
            total: variant[priceProperty] * item.qty,
            marca: variant.marca,
            rubro: variant.rubro,
            nropro: 0,
            parafecha: pedidoCab.parafecha,
            detalle: newOrder.description || '',
            moneda: 'PES',
            ivaporc1: ivaPorc,
            impiva1: ((variant[priceProperty] * Number(ivaPorc)) / 100).toFixed(
              2,
            ),
          },
        });
      });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getOrderNumber(): Promise<Decimal> {
    try {
      //? Consigo numero de pedido
      const { PEDIDO, id }: { PEDIDO: Decimal; id: number } =
        await this.prisma.factura.findFirst({
          where: { PUNTO: 5 },
          select: { PEDIDO: true, id: true },
        });
      const orderNumber = PEDIDO;

      const next = Number(orderNumber) + 1;

      //? Sumo 1 al numero de pedido de la tabla WTF ??? !!
      await this.prisma.factura.update({
        where: { id: id },
        data: { PEDIDO: next },
      });

      return orderNumber;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getClientData(userId: number): Promise<RawClient> {
    try {
      return await this.prisma.cliente.findFirst({
        where: { nrocli: Number(userId) },
      });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getItemData(id: number): Promise<RawVariantProduct> {
    try {
      return await this.prisma.stock.findFirst({
        where: { id: id },
      });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getIva(id: number): Promise<Decimal> {
    try {
      const { ivagrupo } = await this.prisma.stock.findFirst({
        where: { id: id },
        select: { ivagrupo: true },
      });

      const { porcen1 } = await this.prisma.ivaart.findFirst({
        where: { codigo: ivagrupo },
        select: { porcen1: true },
      });

      return porcen1;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
