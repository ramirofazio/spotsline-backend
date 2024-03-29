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

  selectOpt = {
    id: true,
    codven: true,
    email: true,
    nombre: true,
    clave: true,
    comision: true,
    comicob: true,
    firstSignIn: true,
    web_role: true,
  };

  async findById(id: number): Promise<Seller | null> {
    try {
      //TODO ACTUALIZAR ANY
      const rawSeller: any = await this.prisma.vende.findUnique({
        where: { codven: id },
        select: this.selectOpt,
      });

      if (!rawSeller) {
        return null;
      }

      return new Seller(rawSeller);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async findByEmail(email: string): Promise<Seller | null> {
    try {
      const rawSeller: any = await this.prisma.vende.findFirst({
        where: { email: email },
        select: this.selectOpt,
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

      if (!seller.firstSignIn) {
        //? si el vendedor ya hizo su primer inicio, tira el error
        throw new UnauthorizedException();
      }

      //? Pongo firstSignIn en true para chequear que ya hizo su primer inicio
      await this.prisma.vende.update({
        where: { codven: seller.sellerId },
        data: {
          clave: bcrypt.hashSync(newPassword, 10) /* , firstSignIn: false */,
        },
      });

      return HttpStatus.OK;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateForgottenPassword({
    email,
    newPassword,
  }: PasswordResetRequestDTO): Promise<Seller> {
    const seller: Seller = await this.findByEmail(email);
    console.log('entro a seller');
    if (!seller) {
      return null;
    }

    const updated = await this.prisma.vende.update({
      where: { codven: seller.sellerId },
      data: { clave: bcrypt.hashSync(newPassword, 10) },
    });

    HttpStatus.OK;
    return new Seller(updated);
  }
}
