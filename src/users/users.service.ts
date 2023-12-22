import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Client } from 'src/clients/clients.dto';
import { ClientsService } from 'src/clients/clients.service';
import { SellerService } from 'src/seller/seller.service';
import { Seller } from 'src/seller/sellers.dto';
import { User } from './users.dto';
import { PasswordResetRequestDTO } from 'src/auth/auth.dto';

@Injectable()
export class UsersService {
  constructor(
    private clients: ClientsService,
    private sellers: SellerService,
  ) {}

  async findUserByEmail(email: string): Promise<User> {
    const client: Client = await this.clients.findByEmail(email);

    if (client) {
      return new User(client);
    } else {
      const seller: Seller = await this.sellers.findByEmail(email);

      if (seller) {
        return new User(seller);
      }

      throw new HttpException('usuario no encontrado', HttpStatus.NOT_FOUND);
    }
  }

  async firstTimePassword(data: PasswordResetRequestDTO): Promise<HttpStatus> {
    try {
      const clientResponse = await this.clients.firstTimePassword(data);

      if (!clientResponse) {
        const sellerResponse = await this.sellers.firstTimePassword(data);

        if (!sellerResponse) {
          throw new HttpException(
            'usuario no encontrado',
            HttpStatus.NOT_FOUND,
          );
        }

        return sellerResponse;
      }

      return clientResponse;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateForgottenPassword(
    data: PasswordResetRequestDTO,
  ): Promise<Seller | Client> {
    try {
      const clientResponse = await this.clients.updateForgottenPassword(data);
  
      if (!clientResponse) {
        const sellerResponse = await this.sellers.updateForgottenPassword(data);

        if (!sellerResponse) {
          throw new HttpException(
            'usuario no encontrado',
            HttpStatus.NOT_FOUND,
          );
        }

        return sellerResponse;
      }

      return clientResponse;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
