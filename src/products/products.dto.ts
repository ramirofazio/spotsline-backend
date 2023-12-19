import { Decimal } from '@prisma/client/runtime/library';

export interface RawProduct {
  id: number;
  oferta: boolean;
  codpro: string;
  descri: string;
  color: string;
  precio1: Decimal;
  precio2: Decimal;
  precio3: Decimal;
  precio4: Decimal;
  precio5: Decimal;
  precio6: Decimal;
  rubro: number;
  subrub: Decimal;
  marca: Decimal;
}
export class Product {
  id: number;
  offer: boolean;
  productCode: string;
  description: string;
  color: string;
  precio1: Decimal;
  precio2: Decimal;
  precio3: Decimal;
  precio4: Decimal;
  precio5: Decimal;
  precio6: Decimal;
  category: string;
  subRub: string;
  marca: string;

  constructor(
    {
      id,
      oferta,
      codpro,
      descri,
      color,
      precio1,
      precio2,
      precio3,
      precio4,
      precio5,
      precio6,
    }: RawProduct,
    rubro: string,
    subRubro: string,
    marca: string,
  ) {
    this.id = id;
    this.offer = oferta;
    this.productCode = codpro.trim();
    this.description = descri.trim();
    this.color = color.trim();
    this.precio1 = precio1;
    this.precio2 = precio2;
    this.precio3 = precio3;
    this.precio4 = precio4;
    this.precio5 = precio5;
    this.precio6 = precio6;
    this.category = rubro.trim();
    this.subRub = subRubro.trim();
    this.marca = marca.trim();
  }
}
