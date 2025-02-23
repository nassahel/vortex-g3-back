import { Module } from '@nestjs/common';
import { PdfmakeService } from './pdfmake.service';
import { PdfController } from './pdfmake.controller';
import { ChartModule } from '../chart/chart.module';

@Module({
  imports: [ChartModule],  
  providers: [PdfmakeService], 
  controllers: [PdfController], 
  exports: [PdfmakeService],  
})
export class PdfmakeModule {}
