import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateCurrentAccountDTO } from './users.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

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
