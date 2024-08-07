import { Decimal } from '@prisma/client/runtime/library';

export interface NewOrder {
  id: string;
  userId: number;
  email: string;
  orderName: string;
  total: number;
  discount: number;
  mobbexId: string;
  date: string;
  subtotal: Decimal;
  type: string;
  couponId: number;
  deliveryDate: string;
  description?: string;
}
