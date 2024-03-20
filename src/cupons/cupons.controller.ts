import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CuponsService } from './cupons.service';
import { CreateCupon, ChangeState, Cupon } from './cupons.dto';
import { Public } from 'src/auth/publicDecorator';

@Controller('cupon')
export class CuponsController {
  constructor(private readonly CuponsService: CuponsService) {}

  @Public()
  @Get("")
  async getCupons():Promise<Cupon[]> {
    return await this.CuponsService.getCupons()
  }

  @Public()
  @Post("/create")
  async createCupon(@Body() body: CreateCupon):Promise<Cupon> {
    return await this.CuponsService.createCupon(body)
  }

  @Public()
  @Put("/change_state")
  async changeState(@Body() body: ChangeState): Promise<Cupon> {
    return await this.CuponsService.changeState(body)
  }

  @Public()
  @Delete("/delete/:cuponId")
  async deleteCupon(@Param("cuponId") cuponId: number) {
    return await this.CuponsService.deleteCupon(cuponId)
  }
}
