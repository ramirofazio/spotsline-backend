import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RawClient } from 'src/clients/clients.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CCResponse } from './current-account.dto';
import { clicta, cliente, vende } from '@prisma/client';

@Injectable()
export class CurrentAccountService {
  constructor(
    private readonly prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  MAX_TAKE = 10;

  getCCType = (cA: clicta, totalBalance: number, totalDue: number): void => {
    switch (cA.tipodoc) {
      case 'FC':
      case 'FCE':
      case 'ND':
      case 'NDE':
      case 'AJD':
      case 'CT':
        totalDue += Number(cA.debe);
        break;
      case 'RC':
      case 'NC':
      case 'NCE':
      case 'AJC':
        totalBalance += Number(cA.saldo);
        break;
      default:
        console.log('NO hubo coincidencias al sumar la CC', cA.tipodoc);
        break;
    }
  };

  async getOneClientCurrentAccount(token: string): Promise<CCResponse | []> {
    // let last20 = false;

    //TODO CHEQUEAR BIEN LOS VALORES Y QUE SE ESTEN SUMANDO BIEN LOS MONTOS. VER CON FACU y JOSE

    try {
      const verify = await this.jwt.verifyAsync(token);

      const { nrocli, email }: RawClient = await this.prisma.cliente.findFirst({
        where: { nrocli: verify.sub },
      });

      //   // Obtener la fecha actual y la del mes anterior
      //   const currentDate = new Date();
      //   const lastMonthDate = new Date(
      //     currentDate.getFullYear(),
      //     currentDate.getMonth() - 1,
      //     1,
      //   );
      //   const lastMonthISODate = lastMonthDate.toISOString();

      let rawCurrentAccounts: clicta[] | [];

      rawCurrentAccounts = await this.prisma.clicta.findMany({
        take: this.MAX_TAKE,
        where: {
          nrocli: nrocli,
          NOT: {
            //? NO traigo las que tengan estos 2 valores en 0 porque no modifican los totaes.
            AND: [{ saldo: 0 }, { debe: 0 }],
          },
          //fecha: { gte: lastMonthISODate },
        },
        orderBy: { fecha: 'desc' },
      });

      if (Boolean(!rawCurrentAccounts.length)) {
        // //? Si no encontro nada en el ultimo mes
        // last20 = true;
        // rawCurrentAccounts = await this.prisma.clicta.findMany({
        //   take: MAX_TAKE,
        //   where: {
        //     nrocli: nrocli,
        //     NOT: {
        //       //? NO traigo las que tengan estos 2 valores en 0 porque no modifican los totaes.
        //       AND: [{ saldo: 0 }, { debe: 0 }],
        //     },
        //   },
        //   orderBy: { fecha: 'desc' },
        // });
        return [];
      }

      let totalBalance = 0;
      let totalDue = 0;

      rawCurrentAccounts.map((cA) => {
        //? Esto suma las dudas y los saldos de los usuarios. Chequear con JOSE
        this.getCCType(cA, totalBalance, totalDue);
      });

      //TODO FILTRAR LAS CC QUE YA ESTE PAGAS PARA DEVOLVER SOLO LAS QUE DEBE
      return new CCResponse(
        rawCurrentAccounts,
        totalBalance,
        totalDue,
        nrocli,
        email,
      );

      // return { ...response, last20: last20 };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getManagedClientsCurrentAccount(token: string): Promise<CCResponse[]> {
    try {
      const verify = await this.jwt.verifyAsync(token);

      const { codven }: vende = await this.prisma.vende.findFirst({
        //! SACAR HARCODE
        where: { id: verify.sub },
      });

      const managedClients: cliente[] = await this.prisma.cliente.findMany({
        where: { codven: codven },
      });

      if (!managedClients) {
        throw new HttpException(
          'El vendedor no tiene clientes asignados',
          HttpStatus.NOT_FOUND,
        );
      }

      const cleanClientsWithCC = await Promise.all(
        managedClients.map(async ({ nrocli, email }) => {
          const rawCurrentAccounts: clicta[] =
            await this.prisma.clicta.findMany({
              take: this.MAX_TAKE,
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
            this.getCCType(cA, totalBalance, totalDue);
          });

          //TODO FILTRAR LAS CC QUE YA ESTE PAGAS PARA DEVOLVER SOLO LAS QUE DEBE
          return new CCResponse(
            rawCurrentAccounts,
            totalBalance,
            totalDue,
            nrocli,
            email,
          );
        }),
      );

      return cleanClientsWithCC;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

/*

clictad: adeudado y lo que est apendiente de aplicar (Adeudado) CLICTA D ES deuda

clicta son los movimientos ()


 */
