import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCoupon, Coupon } from './coupons.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
  }: CreateCoupon): Promise<HttpStatus> {
    try {
      const exist = await this.prisma.coupons.findFirst({
        where: { name: name },
      });

      if (!exist) {
        await this.prisma.coupons.create({
          data: {
            name,
            discountPercentaje,
            enabled: true,
          },
        });

        return HttpStatus.CREATED;
      }
      throw new HttpException('el cupon ya existe', HttpStatus.BAD_REQUEST);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async changeState(id: number): Promise<HttpStatus> {
    try {
      const thisCoupon = await this.prisma.coupons.findUnique({
        where: { id },
      });

      const newEnable = !thisCoupon.enabled;

      const updatedCupon = await this.prisma.coupons.update({
        where: {
          id,
        },
        data: {
          enabled: newEnable,
        },
      });

      return HttpStatus.ACCEPTED;
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async deleteCoupon(couponId: number): Promise<HttpStatus> {
    try {
      await this.prisma.coupons.findFirstOrThrow({ where: { id: couponId } });

      await this.prisma.coupons.delete({
        where: {
          id: couponId,
        },
      });

      return HttpStatus.OK;
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
