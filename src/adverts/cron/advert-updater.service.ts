import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdvertsService } from '../adverts/adverts.service';

@Injectable()
export class AdvertUpdaterService {
  private readonly logger = new Logger(AdvertUpdaterService.name);

  constructor(private advertsService: AdvertsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCron() {
    this.logger.log('Start of advert updates');

    try {
      await this.advertsService.removeExpired();
      await this.advertsService.updateVip();
      await this.advertsService.updateTop();
      this.logger.log('Update adverts is finished');
    } catch (error) {
      this.logger.error('Errored due adverts update: ', error);
    }
  }
}
