import { Decimal } from '@prisma/client/runtime/library';

export interface NewOrder {
  id: string;
  userId: number;
  email: string;
  name: string;
  total: number;
  discount: number;
  mobbexId: string;
  date: string;
  subtotal: Decimal;
  type: string;
  couponId: number;
}
