import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PrinterModule } from '../printer/printer.module';
import { ChartModule } from './chart.module';

@Module({
  imports:[ChartModule, PrinterModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService], 
})
export class ReportsModule {}
