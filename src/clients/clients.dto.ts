import { Decimal } from '@prisma/client/runtime/library';

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
    } = rawClient;

    this.id = nrocli;
    this.socialReason = razsoc.trim();
    this.fantasyName = fantasia.trim();
    this.address = direcc.trim();
    this.businessAdress = direcom.trim();
    this.celphone = telef1.trim();
    this.cuit = Number(cuit);
    this.priceList = Number(lista);
    this.email = email.trim();
    this.sellCondition = Number(cond_vta);
    this.active = inhabilitado;
    this.canSee = visualiza;
    this.password = clave;
    this.firstSignIn = firstSignIn;
  }
}
