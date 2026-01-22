import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface CurrencyData {
  lastUpdate: number;
  data: Record<string, number>;
}

@Injectable()
export class CurrencyService {
  private data: CurrencyData = {
    lastUpdate: 0,
    data: {},
  };

  private readonly H24 = 24 * 60 * 60 * 1000;

  async getCurrency(): Promise<Record<string, number>> {
    if (Date.now() - this.data.lastUpdate >= this.H24) {
      await this.getCurrencyAPI();
    }

    return this.data.data;
  }

  private async getCurrencyAPI(): Promise<void> {
    try {
      const req = await axios.get(
        'https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_8Eo45ITZoIvP57lpNbcl9tmc1qhGssKeYN3Nt9BA&base_currency=GBP',
      );

      if (req.status !== 200) {
        throw new Error('Internal error on Currency API Request');
      }

      this.data.data = req.data.data;
      this.data.lastUpdate = Date.now();
    } catch (error) {
      console.error('Currency API error:', error);
      throw error;
    }
  }
}
