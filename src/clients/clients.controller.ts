import { Controller, Get, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get('/dashboard-clients')
  async getDashboardClients(@Query('page') page: number): Promise<any> {
    return await this.clientsService.getDashboardClients(page);
  }
}
