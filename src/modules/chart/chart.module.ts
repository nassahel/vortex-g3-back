import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ChartService } from './chart.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ChartService],
  exports: [ReportsService, ChartService], 
})
export class ChartModule {}
