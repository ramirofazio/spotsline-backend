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

  constructor(rawClient: RawSeller) {
    const { id, codven, email, nombre, clave, comision, comicob, firstSignIn } =
      rawClient;

    this.id = id;
    this.sellerId = Number(codven);
    this.email = email.trim();
    this.name = nombre.trim();
    this.password = clave.trim();
    this.comission = Number(comision);
    this.sellComission = Number(comicob);
    this.firstSignIn = firstSignIn;
  }
}
