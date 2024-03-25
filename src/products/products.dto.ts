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
  }
}
export interface RawVariantProduct {
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
}

export interface RawProduct {
  codigo: Decimal;
  descripcion: string;
}

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
