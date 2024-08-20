import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CheckoutRequestDTO } from 'src/mobbex/mobbex.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('orders')
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    readonly jwt: JwtService,
  ) {}

  @Get()
  async getOrders() {
    return await this.ordersService.getOrders();
  }

  @Post('create-new-order')
  async createNewOrder(
    @Body() body: CheckoutRequestDTO,
    @Headers('authorization') authorizationHeader: string,
  ) {
    try {
      const [bearer, token] = authorizationHeader.split(' ');
      const verify = await this.jwt.verifyAsync(token);

      if (!verify) throw new UnauthorizedException();

      await this.ordersService.createNewOrder(body);
    } catch (error) {
      throw new Error(error);
    }
  }
}
