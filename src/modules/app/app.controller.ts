import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private configService: ConfigService,
  ) {}


  @Get('config-test')
  testConfig() {
    return {
      aws: {
        region: this.configService.get('AWS_REGION'),
        bucket: this.configService.get('AWS_BUCKET'),
        hasAccessKey: this.configService.get('AWS_ACCESS_KEY_ID'),
        hasSecretKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    };
  }
}
