import { Decimal } from '@prisma/client/runtime/library';

export interface ProductVariantProps {
  id: number;
  description: string;
  offer: boolean;
  productCode: string;
  color: string;
  precio1: Decimal;
  precio2: Decimal;
  precio3: Decimal;
  precio4: Decimal;
  precio5: Decimal;
  precio6: Decimal;
  category: string;
  subRub: string;
  pathImage?: string;
}

export interface ProductProps {
  id: Decimal;
  pathImage?: string;
  description: string;
  variants?: ProductVariantProps[];
}

export class Product implements ProductProps {
  id: Decimal;
  description: string;
  pathImage?: string;
  variants?: ProductVariantProps[];

  constructor({ id, description, pathImage, variants }: ProductProps) {
    this.id = id;
    this.description = description.trim();
    this.pathImage = pathImage;
    this.variants = variants;
  }
}

export class ProductVariant implements ProductVariantProps {
  id: number;
  description: string;
  productCode: string;
  color: string;
  offer: boolean;
  category: string;
  subRub: string;
  pathImage?: string;
  precio1: Decimal;
  precio2: Decimal;
  precio3: Decimal;
  precio4: Decimal;
  precio5: Decimal;
  incluido: boolean;
  precio6: Decimal;
  constructor(variant: RawVariantProduct, rubro: string, subrubro: string) {
    this.id = variant.id;
    this.description = variant?.descri.trim();
    this.productCode = variant?.codpro.trim();
    this.color = variant?.color.trim();
    this.offer = variant.oferta;
    this.category = rubro?.trim();
    this.subRub = subrubro?.trim();
    this.pathImage = variant.pathfoto2;
    this.precio1 = variant.precio1;
    this.precio2 = variant.precio2;
    this.precio3 = variant.precio3;
    this.precio4 = variant.precio4;
    this.precio5 = variant.precio5;
    this.precio6 = variant.precio6;
    this.incluido = variant.incluido;
  }
}
export interface RawVariantProduct {
  // tabla stock
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
  rubro?: number;
  subrub?: Decimal;
  marca?: Decimal;
  pathfoto2: string;
  incluido: boolean;
}

export interface RawProduct {
  // tabla marcas
  codigo: Decimal;
  descripcion: string;
  /*   rubro: number;
  subrub: Decimal;
  marca: Decimal;
  pathfoto: string; */
}

/* export class Product {
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
  pathfoto: string;

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
      pathfoto,
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
    this.pathfoto = pathfoto.trim()
  }
} */

export interface Pagination {
  metadata: {
    total_pages: number;
    total_items: number;
    items_per_page: number;
    current_page: number;
    search_term: string;
    next_page: number;
  };
  rows: ProductProps[];
}

export class OrderProduct {
  id: number;
  qty: number;

  constructor({ productId, qty }) {
    this.id = productId;
    this.qty = qty;
  }
}

export interface RawOrderProduct {
  productId: number;
  qty: number;
}

export interface UpdateFeatured {
  productCode: string;
  featured: boolean;
}
