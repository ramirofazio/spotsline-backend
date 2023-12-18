import {
  Injectable,
  HttpStatus,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RawSeller, Seller } from './sellers.dto';
import { PasswordResetRequestDTO } from 'src/auth/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SellerService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<Seller | null> {
    try {
      const rawSeller: RawSeller = await this.prisma.vende.findFirst({
        where: { email: email },
        select: {
          id: true,
          codven: true,
          email: true,
          nombre: true,
          clave: true,
          comision: true,
          comicob: true,
          firstSignIn: true,
        },
      });

      if (!rawSeller) {
        return null;
      }

      return new Seller(rawSeller);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async firstTimePassword({ email, newPassword }: PasswordResetRequestDTO) {
    try {
      const seller: Seller = await this.findByEmail(email);

      if (!seller) {
        return null;
      }

      if (seller.firstSignIn) {
        throw new UnauthorizedException();
      }

      await this.prisma.vende.update({
        where: { codven: seller.sellerId },
        data: { clave: bcrypt.hashSync(newPassword, 10), firstSignIn: true },
      });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateForgottenPassword({
    email,
    newPassword,
  }: PasswordResetRequestDTO): Promise<HttpStatus> {
    const seller: Seller = await this.findByEmail(email);

    if (!seller) {
      return null;
    }

    await this.prisma.vende.update({
      where: { codven: seller.sellerId },
      data: { clave: bcrypt.hashSync(newPassword, 10) },
    });

    //todo: Estaria bueno que directamente lo loggee y devuela el access_token
  }
}
