import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Query,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { AddEmailBodyDTO, Client } from './clients.dto';

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
}
