import { Decimal } from '@prisma/client/runtime/library';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Client } from 'src/clients/clients.dto';
import { MobbexItem, RequestItemDTO } from 'src/mobbex/mobbex.dto';
import { Seller } from 'src/seller/sellers.dto';
import { Coupon } from 'src/cupons/coupons.dto';
export class User {
  id: number;
  email: string;
  password: string;
  firstSignIn: boolean;
  web_role: number;
  priceList: number;
  fantasyName: string;
  celphone: string;

  constructor({
    id,
    email,
    password,
    firstSignIn,
    web_role,
    priceList,
    fantasyName,
    celphone,
  }: Client) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.firstSignIn = firstSignIn;
    this.web_role = web_role;
    this.priceList = priceList;
    this.fantasyName = fantasyName;
    this.celphone = celphone;
  }
}
export class SellerUser {
  id: number;
  email: string;
  password: string;
  firstSignIn: boolean;
  web_role: number;

  constructor({ id, email, password, firstSignIn, web_role }: Seller) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.firstSignIn = firstSignIn;
    this.web_role = web_role;
  }
}

export class UserResponse {
  id: number;
  email: string;
  firstSignIn: boolean;
  web_role: number;
  priceList?: number;

  constructor({ id, email, firstSignIn, web_role, priceList = 0 }) {
    this.id = id;
    this.email = email;
    this.firstSignIn = firstSignIn;
    this.web_role = web_role;
    this.priceList = priceList;
  }
}

export interface CCorriente {
  saldo: Decimal;
  debe: Decimal;
  haber: Decimal;
  cobro: Decimal;
  fecha: Date;
  fechafac: Date;
  tipodoc: string;
  letra: string;
  punto: Decimal;
  numero: Decimal;
}

export class UpdateCurrentAccountDTO {
  @IsNotEmpty()
  @IsNumber()
  saldo: Decimal;

  @IsNotEmpty()
  @IsNumber()
  debe: Decimal;

  @IsNotEmpty()
  @IsNumber()
  haber: Decimal;

  @IsNotEmpty()
  @IsNumber()
  cobro: Decimal;

  //? Estos datos son mockup, no se bien si hay que modificar esto, pero es para armar la estructura
}
export class OrderBodyDTO {
  @IsOptional()
  couponId?: number;

  @IsNumber()
  @IsNotEmpty()
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

  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  deliveryDate: string;

  @IsString()
  @IsOptional()
  description: string;
}

export class UserOrdersDTO {
  @IsNumber()
  @IsNotEmpty()
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

  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @IsNotEmpty()
  @IsString()
  type: string;
}

export interface UserOrders {
  id: string | number;
  date: Date;
  discount: number;
  couponId: number | false;
  mobbexId: string | Decimal;
  total: Decimal;
  subtotal: Decimal | false;
  type: string | false;
}

export interface CleanOrders extends UserOrders {
  products: MobbexItem[];
  coupon?: Coupon;
}

export class UpdateUserDataDTO {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  cuit: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}

export interface web_order_DTO {
  total: number;
  subtotal: Decimal;
  couponId: number;
  discount: number;
  type: string;
  mobbexId: string;
}

export interface PedidoCabDTO {
  id: number;
  fechaing: Date;
  nroped: Decimal;
  TotalNet: Decimal;
}

export interface PedidoDetDTO {
  cantidad: Decimal;
  descri: string;
  marca: Decimal;
}

export class GetOneOrderDTO {
  @IsNotEmpty()
  @IsString()
  order_id: string;

  @IsNotEmpty()
  @IsNumber()
  user_id: number;
}
