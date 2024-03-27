import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCoupon, Coupon } from './coupons.dto';

@Controller('coupon')
export class CouponsController {
  constructor(private readonly CouponsService: CouponsService) {}

  @Get('')
  async getCoupons(): Promise<Coupon[]> {
    return await this.CouponsService.getCoupons();
  }

  @Get('/validate/:couponName')
  async validateCoupon(
    @Param('couponName') couponName: string,
  ): Promise<Coupon> {
    return await this.CouponsService.validateCoupon(couponName);
  }

  @Post('/create')
  async createCoupon(@Body() body: CreateCoupon): Promise<HttpStatus> {
    return await this.CouponsService.createCoupon(body);
  }

  @Patch('/change_state')
  async changeState(@Body() { id }: { id: number }): Promise<HttpStatus> {
    return await this.CouponsService.changeState(id);
  }

  @Delete('/delete/:couponId')
  async deleteCoupon(@Param('couponId') couponId: number): Promise<HttpStatus> {
    return await this.CouponsService.deleteCoupon(couponId);
  }
}
