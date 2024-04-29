import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RawClient } from 'src/clients/clients.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CCResponse } from './current-account.dto';
import { clicta } from '@prisma/client';

@Injectable()
export class CurrentAccountService {
  constructor(
    private readonly prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async getOneClientCurrentAccount(token: string): Promise<CCResponse> {
    try {
      const verify = await this.jwt.verifyAsync(token);

      const { nrocli }: RawClient = await this.prisma.cliente.findFirst({
        //! SACAR HARCODE
        where: { nrocli: 7 || verify.sub },
      });

      const rawCurrentAccounts: clicta[] = await this.prisma.clicta.findMany({
        where: {
          nrocli: nrocli,
          NOT: {
            //? NO traigo las que tengan estos 2 valores en 0 porque no modifican los totaes.
            AND: [{ saldo: 0 }, { debe: 0 }],
          },
        },
        orderBy: { fecha: 'desc' },
      });

      let totalBalance = 0;
      let totalDue = 0;

      rawCurrentAccounts.map((cA) => {
        //? Esto suma las dudas y los saldos de los usuarios. Chequear con JOSE
        switch (cA.tipodoc) {
          case 'FC':
            totalDue += Number(cA.debe);
            break;
          case 'FCE':
            totalDue += Number(cA.debe);
            break;
          case 'ND':
            totalDue += Number(cA.debe);
            break;
          case 'NDE':
            totalDue += Number(cA.debe);
            break;
          case 'AJD':
            totalDue += Number(cA.debe);
            break;
          case 'CT':
            totalDue += Number(cA.debe);
            break;
          case 'RC':
            totalBalance += Number(cA.saldo);
            break;
          case 'NC':
            totalBalance += Number(cA.saldo);
            break;
          case 'NCE':
            totalBalance += Number(cA.saldo);
            break;
          case 'AJC':
            totalBalance += Number(cA.saldo);
            break;
          default:
            console.log('NO hubo coincidencias al sumar la CC', cA.tipodoc);
            break;
        }
      });

      //TODO FILTRAR LAS CC QUE YA ESTE PAGAS PARA DEVOLVER SOLO LAS QUE DEBE
      return new CCResponse(rawCurrentAccounts, totalBalance, totalDue);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

/*

clictad: adeudado y lo que est apendiente de aplicar (Adeudado) CLICTA D ES deuda

clicta son los movimientos ()


 */
