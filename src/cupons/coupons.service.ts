import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCoupon, Coupon, ChangeState } from './coupons.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCoupons(): Promise<Coupon[]> {
    return await this.prisma.coupons.findMany();
  }

  async validateCoupon(couponName: string): Promise<Coupon> {
    const coupon = await this.prisma.coupons.findFirst({
      where: { name: couponName },
    });
    if (!coupon) {
      throw new HttpException('coupon invalido', HttpStatus.BAD_REQUEST);
    } else if(!coupon.enabled) {
      throw new HttpException('cupon no habilitado', HttpStatus.UNAUTHORIZED);
    }

    return coupon;
  }

  async createCoupon({ discountPercentaje, name }: CreateCoupon): Promise<Coupon> {
    try {
      const coupon = await this.prisma.coupons.create({
        data: {
          name,
          discountPercentaje,
        },
      });

      HttpStatus.CREATED;
      return coupon;
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
  async deleteCoupon(couponId: number): Promise<Coupon> {
    try {
      await this.prisma.coupons.findFirstOrThrow({ where: { id: couponId } });

      const deletedCoupon = await this.prisma.coupons.delete({
        where: {
          id: couponId,
        },
      });

      HttpStatus.ACCEPTED;
      return deletedCoupon;
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
