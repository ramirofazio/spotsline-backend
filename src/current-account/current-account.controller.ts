import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { CurrentAccountService } from './current-account.service';

@Controller('current-account')
export class CurrentAccountController {
  constructor(private currentAccountService: CurrentAccountService) {}

  @Get('one')
  async getOneClientCurrentAccount(
    @Headers('authorization') authorizationHeader: string,
  ) {
    if (!authorizationHeader) {
      throw new UnauthorizedException();
    }

    const [bearer, token] = authorizationHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    return await this.currentAccountService.getOneClientCurrentAccount(token);
  }
}
