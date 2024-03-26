import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCoupon, Coupon, ChangeState } from './coupons.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCoupons(): Promise<Coupon[]> {
    try {
      const coupons = await this.prisma.coupons.findMany();
      HttpStatus.OK;
      return coupons;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async validateCoupon(couponName: string): Promise<Coupon> {
    try {
      const coupon = await this.prisma.coupons.findFirst({
        where: { name: couponName },
      });

      if (!coupon) {
        throw new HttpException('coupon invalido', HttpStatus.BAD_REQUEST);
      } else if (!coupon.enabled) {
        throw new HttpException('cupon no habilitado', HttpStatus.UNAUTHORIZED);
      }

      return coupon;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createCoupon({
    discountPercentaje,
    name,
  }: CreateCoupon): Promise<string> {
    try {
      await this.prisma.coupons.create({
        data: {
          name,
          discountPercentaje,
        },
      });

      HttpStatus.CREATED;
      return 'created';
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async changeState({ id, enabled }: ChangeState): Promise<Coupon> {
    try {
      await this.prisma.coupons.findFirstOrThrow({ where: { id } });

      const updatedCupon = await this.prisma.coupons.update({
        where: {
          id,
        },
        data: {
          enabled,
        },
      });

      HttpStatus.ACCEPTED;
      return updatedCupon;
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async deleteCoupon(couponId: number): Promise<string> {
    try {
      await this.prisma.coupons.findFirstOrThrow({ where: { id: couponId } });

      await this.prisma.coupons.delete({
        where: {
          id: couponId,
        },
      });

      HttpStatus.ACCEPTED;
      return 'deleted';
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
