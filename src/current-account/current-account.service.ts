import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RawClient } from 'src/clients/clients.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CCResponse } from './current-account.dto';

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
          where: { nrocli: verify.sub },
        });

      if (Number(cond_vta) !== 1 || Number(cond_vta) !== 0) {
        //? Si es distinto de 1 tiene CC (Supuestamente segun Jose)
        const rawCurrentAccount = await this.prisma.clicta.findFirstOrThrow({
          where: { nrocli: nrocli },
        });

        //TODO VER ESO PORQUE CREO QUE ES UN ARRAY DE CC
        const rawCurrentAccountData = await this.prisma.clictad.findMany({
          where: { clictaID: rawCurrentAccount.id },
        });

        const buildResponse = await new CCResponse(
          rawCurrentAccount,
          rawCurrentAccountData,
        );

        return buildResponse;
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
