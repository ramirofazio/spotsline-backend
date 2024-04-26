import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RawClient } from 'src/clients/clients.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CCResponse } from './current-account.dto';
import { clicta, clictad } from '@prisma/client';

@Injectable()
export class CurrentAccountService {
  constructor(
    private readonly prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async getOneClientCurrentAccount(token: string): Promise<CCResponse[] | any> {
    try {
      const verify = await this.jwt.verifyAsync(token);

      const { nrocli, cond_vta }: RawClient =
        await this.prisma.cliente.findFirst({
          //! SACAR HARCODE
          where: { nrocli: 7 || verify.sub },
        });

      //!
      //! CREO QUE ESTO ESTA AL REVES. CLICTA SON LOS MOVIMIENTOS Y CLICTAD ES LA CC GENERAL

      if (Number(cond_vta) !== 1 || Number(cond_vta) !== 0) {
        //? Si es distinto de 1 tiene CC (Supuestamente segun Jose)
        //TODO VER SI ACA ES UNA O SON MUCHAS!!!
        const rawCurrentAccount: clicta[] = await this.prisma.clicta.findMany({
          //TODO ACA TENGO QUE FILTRAR CON ALGO PARA TRAERME LAS CUENTAS ACTIVAS
          where: { nrocli: nrocli },
        });

        //? Estos son los movimientos de la CC
        const rawCurrentAccountData: clictad[] = await Promise.all(
          rawCurrentAccount.map(async ({ id }) => {
            return await this.prisma.clictad.findFirst({
              //TODO VER CON QUE PROP TRAERME LAS CCDATA, SI NROCLI O CLICTAID
              where: { clictaID: id },
            });
          }),
        );

        //TODO ACA HAY QUE MAPEAR Y ENLAZAR LAS CC CON LAS CCDATA PARA CONSTRUIR EL CCRESPONSE
        return rawCurrentAccount.map((cc) => {
          return new CCResponse(cc, rawCurrentAccountData);
        });
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}



/*

clictad: adeudado y lo que est apendiente de aplicar (Adeudado) CLICTA D ES deuda

clicta son los movimientos ()


 */