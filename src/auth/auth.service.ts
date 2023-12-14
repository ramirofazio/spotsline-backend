import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ClientsService } from 'src/clients/clients.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PasswordResetRequest, SignInDto } from './auth.dto';
import { Client } from 'src/clients/clients.dto';
const bcrypt = require('bcrypt');
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private clients: ClientsService,
    private jwt: JwtService,
  ) {}

  //! Update ANY
  async signIn({ email, password }: SignInDto): Promise<any> {
    try {
      const client: Client = await this.clients.findByEmail(email);
      if (!client) {
        throw new HttpException('cliente no encontrado', HttpStatus.NOT_FOUND);
      }

      //   //todo: Agregar props a CLOUD-DB
      //   const match = await bcrypt.compare(password, client.password);
      //   if (!match) {
      //     throw new HttpException(
      //       'contraseña incorrecta',
      //       HttpStatus.UNAUTHORIZED,
      //     );
      //   }

      const payload = { sub: client.id, username: client.email };
      return {
        access_token: await this.jwt.signAsync(payload),
        client,
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async firstTimePassword({
    email,
    token,
    newPassword,
    newPasswordConfirm,
  }: PasswordResetRequest): Promise<HttpStatus> {
    //todo: actualizar contraseña del client y cambiar prop `firstTime: false`

    return HttpStatus.OK;
  }
}
