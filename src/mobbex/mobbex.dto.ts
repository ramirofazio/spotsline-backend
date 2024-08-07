import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';
import { Coupon } from 'src/cupons/coupons.dto';

export class CheckoutRequestDTO {
  @IsNumber()
  @IsNotEmpty()
  discount: number;

  @IsNotEmpty()
  @IsOptional()
  coupon?: Coupon;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  deliveryDate: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RequestItemDTO)
  items: RequestItemDTO[];
}

export class RequestItemDTO {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  qty: number;
}

export interface MobbexCustomer {
  email: string;
  name: string;
  identification: string;
  phone: string;
}

export interface MobbexItem {
  description: string;
  quantity: number;
  total: number;
  image: string;
}

export interface MobbexCheckoutBody {
  webhooksType: string;
  webhook: string;
  total: number;
  currency: string;
  reference: string;
  description: string;
  items: MobbexItem[];
  return_url: string;
  test?: boolean;
  sources: Array<string>;
  customer: MobbexCustomer;
}
