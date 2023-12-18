import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  InitPasswordResetRequestDTO,
  PasswordResetRequestDTO,
  SignInDto,
  SignInResponseDTO,
} from './auth.dto';
const bcrypt = require('bcrypt');
import { JwtService } from '@nestjs/jwt';
import { MailsService } from 'src/mails/mails.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.dto';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private mail: MailsService,
  ) {}

  async signIn({ email, password }: SignInDto): Promise<SignInResponseDTO> {
    try {
      const user: User = await this.users.findUserByEmail(email);

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        throw new HttpException(
          'contraseña incorrecta',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const payload = { sub: user.id, username: user.email };

      return {
        access_token: await this.jwt.signAsync(payload),
        user,
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async firstTimePassword(data: PasswordResetRequestDTO): Promise<HttpStatus> {
    try {
      return await this.users.firstTimePassword(data);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async initPasswordReset({
    email,
  }: InitPasswordResetRequestDTO): Promise<HttpStatus> {
    const user: User = await this.users.findUserByEmail(email);

    const payload = { sub: user.id, username: user.email };

    const temporal_access_token = await this.jwt.signAsync(payload, {
      expiresIn: '1h',
    });

    return await this.mail.test(email, temporal_access_token);
  }

  async confirmPasswordReset(
    data: PasswordResetRequestDTO,
  ): Promise<HttpStatus> {
    return await this.users.updateForgottenPassword(data);
  }
}
