import { Body, Controller, Post, Headers } from '@nestjs/common';
import { MobbexService } from './mobbex.service';
import { UsersService } from 'src/users/users.service';
import { mobbex } from 'mobbex';
import {
  CheckoutRequestDTO,
  MobbexCheckoutBody,
  MobbexPayOrderBody,
  PaymentOrderDTO,
} from './mobbex.dto';
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
  async webHook(@Body() body: any) {
    console.log('----body complete', body);

    console.log('----payment', body.payment);
    console.log('----customer', body.customer);

    const checkoutData = await mobbex.loyalty.search({
      reference: body.payment.reference,
    });

    console.log('checkout data', checkoutData);

    try {
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Post('/pay-order')
  async generatePayOrder(@Body() body: PaymentOrderDTO): Promise<string> {
    //? Genera un link de pago directo para ir cancelando pagos de Cuentas corrientes
    try {
      const payOrderBody: MobbexPayOrderBody =
        await this.mobbexService.generatePayOrderBody(body);

      const payOrder: any = await mobbex.paymentOrder.create(payOrderBody);
      if ('data' in payOrder) {
        return payOrder.data.url;
      }
      if ('error' in payOrder) {
        throw payOrder.error;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
