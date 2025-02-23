import { Module } from '@nestjs/common';
import { ChartController } from './chart.controller';
import { ChartService } from './chart.service';

@Module({
  controllers: [ChartController],
  providers: [ChartService],
  exports: [ChartService],
})
export class ChartModule {}
