import { Body, Controller, Post } from '@nestjs/common';
import { MobbexService } from './mobbex.service';
import { mobbex } from 'mobbex';
import {
  CheckoutRequestDTO,
  MobbexCheckoutBody,
  MobbexPayOrderBody,
  PaymentOrderDTO,
} from './mobbex.dto';

@Controller('mobbex')
export class MobbexController {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly mobbexService: MobbexService) {}

  @Post('/checkout')
  async generateCheckout(@Body() body: CheckoutRequestDTO): Promise<string> {
    //? Genera un link de pago para pagar el carrito, un checkout comun
    try {
      const mobbexBody: MobbexCheckoutBody =
        await this.mobbexService.generateBody(body);

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

  @Post('/pay-order')
  async generatePayOrder(@Body() body: PaymentOrderDTO): Promise<string> {
    //? Genera un link de pago directo para ir cancelando pagos de Cuentas corrientes
    try {
      const payOrderBody: MobbexPayOrderBody =
        await this.mobbexService.generatePayOrderBody(body);

      const payOrder: any = await mobbex.paymentOrder.create(payOrderBody);
      if ('data' in payOrder) {
        //console.log('----->', payOrder);
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
