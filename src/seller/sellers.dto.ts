import { Decimal } from '@prisma/client/runtime/library';

export interface RawSeller {
  id: number;
  codven: Decimal;
  email: string;
  nombre: string;
  clave: string;
  comision: Decimal;
  comicob: Decimal;
  firstSignIn: boolean;
  web_role: number;
}

export class Seller {
  id: number;
  sellerId: number;
  email: string;
  name: string;
  password: string;
  comission: number;
  sellComission: number;
  firstSignIn: boolean;
  web_role: number;

  constructor(rawSeller: RawSeller) {
    const {
      id,
      codven,
      email,
      nombre,
      clave,
      comision,
      comicob,
      firstSignIn,
      web_role,
    } = rawSeller;

    this.id = id;
    this.sellerId = Number(codven);
    this.email = email.trim();
    this.name = nombre.trim();
    this.password = clave.trim();
    this.comission = Number(comision);
    this.sellComission = Number(comicob);
    this.firstSignIn = firstSignIn;
    this.web_role = web_role;
  }
}
export class SellerProfileResponse {
  id: number;
  sellerId: number;
  email: string;
  name: string;
  comission: number;
  sellComission: number;
  firstSignIn: boolean;
  web_role: number;

  constructor({
    id,
    sellerId,
    email,
    name,
    comission,
    sellComission,
    firstSignIn,
    web_role,
  }: Seller) {
    this.id = id;
    this.sellerId = sellerId;
    this.email = email;
    this.name = name;
    this.comission = comission;
    this.sellComission = sellComission;
    this.firstSignIn = firstSignIn;
    this.web_role = web_role;
  }
}
