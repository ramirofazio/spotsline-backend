import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class PaymentOrderDTO {
  @IsNumber()
  @IsNotEmpty()
  total: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}

export class CheckoutRequestDTO {
  @IsNumber()
  @IsOptional()
  discount?: number;

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
  id: number;

  @IsNotEmpty()
  @IsNumber()
  qty: number;
}

export interface MobbexCustomer {
  email: string;
  name: string;
  identification: string;
}

export interface MobbexItem {
  description: string;
  quantity: number;
  total: number;
  image: string;
}

export interface MobbexCheckoutBody {
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

export interface MobbexPayOrderBody {
  total: number;
  description: string;
  reference: string;
  return_url: string;
}
