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
} from './users.dto';
import { ClientProfileResponse } from 'src/clients/clients.dto';
import { SellerProfileResponse } from 'src/seller/sellers.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('profile')
  async getUserProfileData(
    @Headers('authorization') authorizationHeader: string,
  ): Promise<ClientProfileResponse | SellerProfileResponse> {
    if (!authorizationHeader) {
      throw new UnauthorizedException();
    }

    const [bearer, token] = authorizationHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    return await this.userService.getUserProfileData(token);
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

  @Get('order/:order_id')
  async getOneOrder(
    @Headers('authorization') authorizationHeader: string,
    @Param('order_id') order_id: string,
  ): Promise<CleanOrders> {
    if (!authorizationHeader) {
      throw new UnauthorizedException();
    }

    const [bearer, token] = authorizationHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    return await this.userService.getOneOrder(order_id, token);
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
