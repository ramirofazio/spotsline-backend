import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientsService } from 'src/clients/clients.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  InitPasswordResetRequestDTO,
  PasswordResetRequestDTO,
  SignInDto,
  SignInResponseDTO,
} from './auth.dto';
import { Client } from 'src/clients/clients.dto';
const bcrypt = require('bcrypt');
import { JwtService } from '@nestjs/jwt';
import { MailsService } from 'src/mails/mails.service';

@Injectable()
export class AuthService {
  constructor(
    private clients: ClientsService,
    private jwt: JwtService,
    private mail: MailsService,
  ) {}

  async signIn({ email, password }: SignInDto): Promise<SignInResponseDTO> {
    try {
      const client: Client = await this.clients.findByEmail(email);

      const match = await bcrypt.compare(password, client.password);
      if (!match) {
        throw new HttpException(
          'contraseña incorrecta',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const payload = { sub: client.id, username: client.email };

      return {
        access_token: await this.jwt.signAsync(payload),
        client,
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async firstTimePassword(data: PasswordResetRequestDTO): Promise<HttpStatus> {
    try {
      return await this.clients.firstTimePassword(data);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async initPasswordReset({
    email,
  }: InitPasswordResetRequestDTO): Promise<HttpStatus> {
    const client: Client = await this.clients.findByEmail(email);

    const payload = { sub: client.id, username: client.email };

    const temporal_access_token = await this.jwt.signAsync(payload, {
      expiresIn: '1h',
    });

    return await this.mail.test(email, temporal_access_token);
  }

  async confirmResetPassword(
    data: PasswordResetRequestDTO,
  ): Promise<HttpStatus> {
    const verify = await this.jwt.verify(data.token);

    if (!verify) {
      throw new UnauthorizedException();
    }

    return await this.clients.updateForgottenPassword(data);
  }
}
