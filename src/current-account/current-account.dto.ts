import { clicta } from '@prisma/client';

export class CCResponse {
  totalDue: number;
  totalBalance: number;
  data: CCData[];

  constructor(
    rawCurrentAccounts: clicta[],
    totalBalance: number,
    totalDue: number,
  ) {
    this.totalBalance = Math.floor(totalBalance);
    this.totalDue = Math.floor(totalDue);
    this.data = rawCurrentAccounts.map((cA: clicta) => new CCData(cA));
  }
}

export class CCData {
  sellerCode: number;
  date: Date;
  type: string;
  letter: string;
  point: number;
  number: number;
  balance: number;
  due: number;

  constructor({
    codven,
    fecha,
    tipodoc,
    letra,
    punto,
    numero,
    saldo,
    debe,
  }: clicta) {
    this.sellerCode = Number(codven);
    this.date = fecha;
    this.type = tipodoc.trim();
    this.letter = letra.trim();
    this.point = Number(punto);
    this.number = Number(numero);
    this.balance = Math.floor(Number(saldo));
    this.due = Math.floor(Number(debe));
  }
}
