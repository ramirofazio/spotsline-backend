import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  UpdateCurrentAccountDTO,
  OrderBodyDTO,
  CleanOrders,
  UpdateUserDataDTO,
  GetOneOrderDTO,
} from './users.dto';
import { ClientProfileResponse } from 'src/clients/clients.dto';
import { SellerProfileResponse } from 'src/seller/sellers.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('profile/:id')
  async getUserProfileData(
    @Param('id') id: number,
  ): Promise<ClientProfileResponse | SellerProfileResponse> {
    return await this.userService.getUserProfileData(id);
  }

  @Post('update-data')
  async updateUserData(
    @Body() body: UpdateUserDataDTO,
  ): Promise<HttpStatus.OK> {
    return this.userService.updateUserData(body);
  }

  @Get('orders/:id')
  async getUserOrders(@Param('id') id: number): Promise<CleanOrders[]> {
    return await this.userService.getUserOrders(id);
  }

  @Post('one-order')
  async getOneOrder(@Body() body: GetOneOrderDTO): Promise<CleanOrders> {
    const { order_id, user_id } = body;
    return await this.userService.getOneOrder(order_id, user_id);
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
