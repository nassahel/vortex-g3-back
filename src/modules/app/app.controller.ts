import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

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
