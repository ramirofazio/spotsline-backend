import { Controller, Delete, HttpStatus, Param, Post } from '@nestjs/common';

import { CuponsService } from './cupons.service';

@Controller('cupon')
export class CuponsController {
  constructor(private readonly CuponsService: CuponsService) {}
}
