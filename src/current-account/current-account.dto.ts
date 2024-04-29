import { clicta, clictad } from '@prisma/client';

//TODO TERMINAR ESTO BIEN

export class CCResponse {
  sellerCode: number;
  due: number;
  balance: number;
  payment: number;
  credit: number;
  discountedAmount: number;
  date: Date | string;
  invoiceDate: Date | string;
  transactions: CCTransactions[];

  constructor(
    { codven, debe, saldo, cobro, haber, impbonif, fecha, fechafac }: clicta,
    rawCurrentAccountData: clictad[],
  ) {
    //TODO raw to clean properties
  }
}

export class CCTransactions {}
