import { Decimal } from '@prisma/client/runtime/library';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export interface RawClient {
  nrocli: number;
  razsoc: string;
  fantasia: string;
  direcc: string;
  direcom: string;
  telef1: string;
  cuit: string;
  lista: Decimal;
  email: string;
  cond_vta: Decimal;
  inhabilitado: boolean;
  visualiza: boolean;
  clave: string;
  firstSignIn: boolean;
  web_role: number;
  codven: Decimal;
  condicion: Decimal;
  expreso: Decimal;
  locali: number;
  avatar: string;
}

export class Client {
  id: number;
  socialReason: string;
  fantasyName: string;
  address: string;
  businessAdress: string;
  celphone: string;
  cuit: number;
  priceList: number;
  email: string;
  sellCondition: number;
  active: boolean;
  canSee: boolean;
  password: string;
  firstSignIn: boolean;
  web_role: number;
  avatar?: string;

  constructor(rawClient: RawClient) {
    const {
      nrocli,
      razsoc,
      fantasia,
      direcc,
      direcom,
      telef1,
      cuit,
      lista,
      email,
      cond_vta,
      inhabilitado,
      visualiza,
      clave,
      firstSignIn,
      web_role,
      avatar,
    } = rawClient;

    this.id = nrocli;
    this.socialReason = razsoc.trim();
    this.fantasyName = fantasia.trim();
    this.address = direcc.trim();
    this.businessAdress = direcom.trim();
    this.celphone = telef1.trim();
    this.cuit = Number(cuit);
    this.priceList = Number(lista);
    this.email = email.trim().split(';')[0];
    this.sellCondition = Number(cond_vta);
    this.active = inhabilitado;
    this.canSee = visualiza;
    this.password = clave.trim();
    this.firstSignIn = firstSignIn;
    this.web_role = web_role;
    this.avatar = avatar;
  }
}

export class ClientProfileResponse {
  id: number;
  socialReason: string;
  fantasyName: string;
  address: string;
  businessAdress: string;
  celphone: string;
  cuit: number;
  priceList: number;
  email: string;
  sellCondition: number;
  active: boolean;
  canSee: boolean;
  firstSignIn: boolean;
  web_role: number;
  avatar?: string;
  constructor({
    id,
    socialReason,
    fantasyName,
    address,
    businessAdress,
    celphone,
    cuit,
    priceList,
    email,
    sellCondition,
    active,
    canSee,
    firstSignIn,
    web_role,
    avatar,
  }: Client) {
    this.id = id;
    this.socialReason = socialReason;
    this.fantasyName = fantasyName;
    this.address = address;
    this.businessAdress = businessAdress;
    this.celphone = celphone;
    this.cuit = cuit;
    this.priceList = priceList;
    this.email = email;
    this.sellCondition = sellCondition;
    this.active = active;
    this.canSee = canSee;
    this.firstSignIn = firstSignIn;
    this.web_role = web_role;
    this.avatar = avatar;
  }
}

export class AddEmailBodyDTO {
  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  newEmail: string;
}

export class ManagedClientResponse {
  id: number;
  email: string;
  fantasyName: string;
  avatar: string;
  shoppingCart: boolean;
  priceList: number;

  constructor({ id, email, fantasyName, avatar, shoppingCart, priceList }) {
    this.id = id;
    this.email = email;
    this.fantasyName = fantasyName;
    this.avatar = avatar;
    this.shoppingCart = shoppingCart;
    this.priceList = priceList;
  }
}
