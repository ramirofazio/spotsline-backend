import { clicta } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class CCResponse {
  clientNumber: number;
  clientEmail: string;
  totalDue: number;
  totalBalance: number;
  sellerCode: number;
  sellerName: string;
  fantasyName: string;
  data: CCData[];
  zone: number;
  phone: string;
  address: string;
  cuit: string;

  constructor(
    rawCurrentAccounts: clicta[],
    totalBalance: number,
    totalDue: number,
    nrocli: number,
    email: string,
    codven: Decimal,
    fantasia: string,
    zona: Decimal,
    telef1: string,
    direcc: string,
    direcom: string,
    cuit: string,
    nombre: string,
  ) {
    this.clientNumber = Number(nrocli);
    this.clientEmail = email.trim();
    this.totalBalance = Math.floor(totalBalance);
    this.totalDue = Math.floor(totalDue);
    this.data = rawCurrentAccounts.map((cA: clicta) => new CCData(cA));
    this.sellerCode = Number(codven);
    this.fantasyName = fantasia.trim();
    this.sellerName = nombre.trim();
    this.zone = Number(zona);
    this.phone = telef1.trim();
    this.address = direcc.trim() || direcom.trim();
    this.cuit = cuit.trim();
  }
}

export class CCData {
  date: Date;
  type: string;
  letter: string;
  point: number;
  number: number;
  balance: number;
  due: number;

  constructor({ fecha, tipodoc, letra, punto, numero, saldo, debe }: clicta) {
    this.date = fecha;
    this.type = tipodoc.trim();
    this.letter = letra.trim();
    this.point = Number(punto);
    this.number = Number(numero);
    this.balance = Math.floor(Number(saldo));
    this.due = Math.floor(Number(debe));
  }
}
