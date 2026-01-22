import { Body, Controller, HttpException, HttpStatus, Post, UseGuards, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from './auth.guard';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

class CheckoutDTO {
  @Min(1)
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  currency: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard)
  @Post('checkout')
  async create_checkout_token(@Body() payload: CheckoutDTO) {
    try {
      const clientSecret = await this.paymentsService.createCheckoutToken(payload.amount, payload.currency);
      return clientSecret;
    } catch (e: any) {
      throw new HttpException(e.message || 'Payment error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
