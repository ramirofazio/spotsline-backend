import { Body, Controller, Post, Headers } from '@nestjs/common';
import { MobbexService } from './mobbex.service';
import { UsersService } from 'src/users/users.service';
import { mobbex } from 'mobbex';
import { CheckoutRequestDTO, MobbexCheckoutBody } from './mobbex.dto';
import { Public } from 'src/auth/publicDecorator';

@Controller('mobbex')
export class MobbexController {
  // eslint-disable-next-line no-unused-vars
  constructor(
    private readonly mobbexService: MobbexService,
    private readonly userService: UsersService,
  ) {}

  @Post('/checkout')
  async generateCheckout(
    @Body() body: CheckoutRequestDTO,
    @Headers('authorization') authorizationHeader: string,
  ): Promise<string> {
    //? Genera un link de pago para pagar el carrito, un checkout comun
    try {
      const [bearer, token] = authorizationHeader.split(' ');
      const profile = await this.userService.getUserProfileDataWithJwt(token);

      const mobbexBody: MobbexCheckoutBody =
        await this.mobbexService.generateBody({ ...body, userId: profile.id });

      const checkout: any = await mobbex.checkout.create(mobbexBody);
      if ('data' in checkout) {
        return checkout.data.url;
      }
      if ('error' in checkout) {
        throw checkout.error;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Public()
  @Post('/webhook')
  //? El type del body seria una respuesta del webhook de mobbex:
  async webHook(@Body() { data }: any) {
    try {
      await this.mobbexService.webhookResponse(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
