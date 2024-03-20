import { Body, Controller, Delete, HttpStatus, Param, Post } from '@nestjs/common';
import { CuponsService } from './cupons.service';
import { CreateCupon, ChangeState, Cupon } from './cupons.dto';
import { Public } from 'src/auth/publicDecorator';

@Controller('cupon')
export class CuponsController {
  constructor(private readonly CuponsService: CuponsService) {}

  @Public()
  @Post("/create")
  async createCupon(@Body() body: CreateCupon):Promise<Cupon> {
    return await this.CuponsService.createCupon(body)
  }

  @Public()
  @Post("/change_state")
  async changeState(@Body() body: ChangeState) {
    return await this.CuponsService.changeState(body)
  }

}
