import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  UpdateCurrentAccountDTO,
  OrderBodyDTO,
  UserOrdersDTO,
  CleanOrders,
} from './users.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('orders')
  async getUserOrders(@Body() { id }: { id: number }): Promise<CleanOrders[]> {
    return await this.userService.getUserOrders(id);
  }

  @Post('create-order')
  async createOrder(@Body() body: OrderBodyDTO): Promise<HttpStatus> {
    return await this.userService.createOrder(body);
  }

  @Get('current-account/:nroCli')
  async getCurrentAccount(@Param('nroCli') nroCli: string) {
    return await this.userService.getCurrentAccount(nroCli);
  }

  @Patch('update-current-account/:nroCli')
  async updateCurrentAccount(
    @Param('nroCli') nroCli: string,
    @Body() body: UpdateCurrentAccountDTO,
  ) {
    return await this.userService.updateCurrentAccount(nroCli, body);
  }
}
