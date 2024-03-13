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
} from './users.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('profile')
  async getOneUserData(@Headers('authorization') authorizationHeader: string) {
    if (!authorizationHeader) {
      throw new UnauthorizedException();
    }

    const [bearer, token] = authorizationHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    return await this.userService.getUserData(token);
  }

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
