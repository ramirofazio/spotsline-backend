import { Body, Controller, Get, HttpStatus, Patch } from '@nestjs/common';
import { SellerProfileResponse, AddEmailBodyDTO } from './sellers.dto';
import { SellerService } from './seller.service';

@Controller('sellers')
export class SellerController {
  constructor(private sellerService: SellerService) {}

  @Patch('add-email')
  async addEmailToSeller(@Body() body: AddEmailBodyDTO): Promise<HttpStatus> {
    return await this.sellerService.addEmailToSeller(body);
  }

  @Get('/dashboard-sellers')
  async getDashboardSellers(): Promise<SellerProfileResponse[]> {
    return await this.sellerService.getDashboardSellers();
  }
}
