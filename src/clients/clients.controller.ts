import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Patch,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { AddEmailBodyDTO, Client, ManagedClientResponse } from './clients.dto';

@Controller('clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Patch('add-email')
  async addEmailToClient(@Body() body: AddEmailBodyDTO): Promise<HttpStatus> {
    return await this.clientsService.addEmailToClient(body);
  }

  @Get('/dashboard-clients')
  async getDashboardClients(@Query('page') page: number): Promise<Client[]> {
    return await this.clientsService.getDashboardClients(page);
  }

  @Get('managed-clients')
  async getManagedClients(
    @Headers('authorization') authorizationHeader: string,
  ): Promise<ManagedClientResponse[]> {
    if (!authorizationHeader) {
      throw new UnauthorizedException();
    }

    const [bearer, token] = authorizationHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    return await this.clientsService.getManagedClients(token);
  }
}
