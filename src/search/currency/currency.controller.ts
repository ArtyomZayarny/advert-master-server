import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('')
  async getCurrentExchangeRates() {
    try {
      return await this.currencyService.getCurrency();
    } catch (e) {
      throw new HttpException("Can't get current exchange rates", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
