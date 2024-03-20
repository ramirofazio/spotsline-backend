import { Body, Controller, Delete, HttpStatus, Param, Post } from '@nestjs/common';
import { CreateCupon } from './cupons.dto';
import { CuponsService } from './cupons.service';

@Controller('cupon')
export class CuponsController {
  constructor(private readonly CuponsService: CuponsService) {}

  @Post("/create")
  async createCupon(@Body() body: any) {
    return await this.CuponsService.createCupon(body)
  }

}
