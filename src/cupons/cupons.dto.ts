
export interface CreateCupon {
  name: string;
  discountPercentaje: number;
}

export interface ChangeState {
  id: number;
  enabled: boolean;
}

export interface Cupon {
  id: number;
  name: string;
  discountPercentaje: number;
  enabled: boolean;
}