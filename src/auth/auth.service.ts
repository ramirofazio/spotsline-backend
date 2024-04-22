import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  InitPasswordResetRequestDTO,
  JwtAutoSignInDTO,
  PasswordResetRequestDTO,
  SignInDto,
  SignInResponseDTO,
} from './auth.dto';
const bcrypt = require('bcrypt');
import { JwtService } from '@nestjs/jwt';
import { MailsService } from 'src/mails/mails.service';
import { UsersService } from 'src/users/users.service';
import { ShoppingCartService } from 'src/shopping-cart/shopping-cart.service';
import { SellerUser, User, UserResponse } from 'src/users/users.dto';
import { env } from 'process';
import { ShoppingCart } from 'src/shopping-cart/shoppingCart.dto';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private mail: MailsService,
    private shoppingCart: ShoppingCartService,
  ) {}

  async jwtAutoSignIn({
    jwt,
    email,
    managedClient,
  }: JwtAutoSignInDTO): Promise<SignInResponseDTO> {
    try {
      const verify = await this.jwt.verifyAsync(jwt);

      if (verify) {
        const user: User | SellerUser = await this.users.findUserByEmail(email);

        if (!managedClient) {
          //? Si no existe cargo el user normal con su carrito
          const shoppingCart: ShoppingCart | null =
            await this.shoppingCart.getCart(user.id);

          return {
            access_token: jwt,
            user: new UserResponse(user),
            shoppingCart,
          };
        } else {
          const { id }: User | SellerUser = await this.users.findUserByEmail(
            managedClient.email,
          );

          //TODO VER ESTE NULL. El carrito se crea si o si cuando inician sesion si no existe, o cuando el vendedor los selecciona para gestionar
          const shoppingCart: ShoppingCart | null =
            await this.shoppingCart.getCart(id);

          return {
            access_token: jwt,
            user: new UserResponse(user),
            shoppingCart,
          };
        }
      }
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async signIn({ email, password }: SignInDto): Promise<SignInResponseDTO> {
    try {
      const user: User | SellerUser = await this.users.findUserByEmail(email);

      if (password !== env.DEFAULT_USER_PASSWORD) {
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          throw new HttpException(
            'contraseña incorrecta',
            HttpStatus.UNAUTHORIZED,
          );
        }
      }

      const payload = { sub: user.id, username: user.email };
      const responseUser = new UserResponse(user);

      const shoppingCart = await this.shoppingCart.getCart(responseUser.id);

      return {
        access_token: await this.jwt.signAsync(payload),
        user: responseUser,
        shoppingCart,
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
    const user: User | SellerUser = await this.users.findUserByEmail(email);

    const payload = { sub: user.id, username: user.email };

    const temporal_access_token = await this.jwt.signAsync(payload, {
      expiresIn: '2h',
    });

    return await this.mail.sendInitPasswordReset(email, temporal_access_token);
  }

  async confirmPasswordReset(
    data: PasswordResetRequestDTO,
  ): Promise<SignInResponseDTO> {
    const res = await this.users.updateForgottenPassword(data);

    if (res) {
      return this.signIn({ email: data.email, password: data.newPassword });
    }
  }
}
