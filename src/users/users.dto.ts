import { Decimal } from '@prisma/client/runtime/library';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Client } from 'src/clients/clients.dto';
import { Seller } from 'src/seller/sellers.dto';
export class User {
  id: number;
  email: string;
  password: string;
  firstSignIn: boolean;
  web_role: number;
  priceList: number;
  fantasyName: string;

  constructor({
    id,
    email,
    password,
    firstSignIn,
    web_role,
    priceList,
    fantasyName,
  }: Client) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.firstSignIn = firstSignIn;
    this.web_role = web_role;
    this.priceList = priceList;
    this.fantasyName = fantasyName;
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

  constructor({ id, email, firstSignIn, web_role }) {
    this.id = id;
    this.email = email;
    this.firstSignIn = firstSignIn;
    this.web_role = web_role;
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