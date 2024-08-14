export interface CreateCoupon {
  couponName: string;
  discountPercentaje: number;
}

export interface Coupon {
  id: number;
  couponName: string;
  discountPercentaje: number;
  enabled: boolean;
}
