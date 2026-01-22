import { Controller, Get } from '@nestjs/common';
import { HealthCheckResponse } from '@app/common';

@Controller('health')
export class HealthController {
  @Get()
  async check(): Promise<HealthCheckResponse> {
    const uptime = process.uptime();

    return {
      status: 'ok',
      service: 'payments-service',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
    };
  }
}
