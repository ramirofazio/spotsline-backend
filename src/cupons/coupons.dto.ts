export interface CreateCoupon {
  name: string;
  discountPercentaje: number;
}

export interface Coupon {
  id: number;
  name: string;
  discountPercentaje: number;
  enabled: boolean;
}
