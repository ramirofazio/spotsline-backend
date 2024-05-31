import {
  Controller,
  Get,
  Headers,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { CurrentAccountService } from './current-account.service';
import { CCResponse } from './current-account.dto';

@Controller('current-account')
export class CurrentAccountController {
  constructor(private currentAccountService: CurrentAccountService) {}

  @Get('one/:id')
  async getOneClientCurrentAccount(
    @Param('id') id: number,
  ): Promise<CCResponse | []> {
    return await this.currentAccountService.getOneClientCurrentAccount(id);
  }

  //   @Get('managedClients')
  //   async getManagedClientsCurrentAccount(
  //     @Headers('authorization') authorizationHeader: string,
  //   ): Promise<CCResponse[]> {
  //     if (!authorizationHeader) {
  //       throw new UnauthorizedException();
  //     }

  //     const [bearer, token] = authorizationHeader.split(' ');

  //     if (bearer !== 'Bearer' || !token) {
  //       throw new UnauthorizedException('Invalid authorization header format');
  //     }

  //     return await this.currentAccountService.getManagedClientsCurrentAccount(
  //       token,
  //     );
  //   }
}
