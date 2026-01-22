import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const stripeKey = this.configService.get('STRIPE_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_KEY is required');
    }
    this.stripe = new Stripe(stripeKey);
  }

  async createCheckoutToken(amount: number, currency: string): Promise<string> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency,
        description: 'Payment for Advert Master services',
        statement_descriptor: 'ADVERT',
        statement_descriptor_suffix: 'Services',
        metadata: {
          application: 'AdvertMaster',
        },
      });

      return paymentIntent.client_secret || '';
    } catch (e: any) {
      console.error('Stripe error:', e);
      throw new HttpException(e.message || 'Payment error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
