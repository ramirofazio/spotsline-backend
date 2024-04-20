import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/auth/publicDecorator';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  async getOrders() {
    return await this.ordersService.getOrders();
  }
}
