import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CheckoutRequest {
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
  @Type(() => RequestItem)
  items: RequestItem[];
}

export class RequestItem {
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

export interface MobbexBody {
  total: number;
  currency: string;
  reference: string;
  description: string;
  items: MobbexItem[];
  return_url: string;
  test?: boolean;
  customer: MobbexCustomer;
}
