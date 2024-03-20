
export interface CreateCoupon {
  name: string;
  discountPercentaje: number;
}

export interface ChangeState {
  id: number;
  enabled: boolean;
}

export interface Coupon {
  id: number;
  name: string;
  discountPercentaje: number;
  enabled: boolean;
}