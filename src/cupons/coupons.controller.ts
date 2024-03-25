import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCoupon, ChangeState, Coupon } from './coupons.dto';
import { Public } from 'src/auth/publicDecorator';

@Controller('coupon')
export class CouponsController {
  constructor(private readonly CouponsService: CouponsService) {}

  @Get("")
  async getCoupons():Promise<Coupon[]> {
    return await this.CouponsService.getCoupons()
  }

  @Public()
  @Get("/validate/:couponName")
  async validateCoupon(@Param("couponName") couponName: string):Promise<Coupon> {
    return await this.CouponsService.validateCoupon(couponName)
  }

  @Public()
  @Post("/create")
  async createCoupon(@Body() body: CreateCoupon):Promise<Coupon> {
    return await this.CouponsService.createCoupon(body)
  }

  @Public()
  @Put("/change_state")
  async changeState(@Body() body: ChangeState): Promise<Coupon> {
    return await this.CouponsService.changeState(body)
  }

  @Public()
  @Delete("/delete/:couponId")
  async deleteCoupon(@Param("couponId") couponId: number) {
    return await this.CouponsService.deleteCoupon(couponId)
  }
}
