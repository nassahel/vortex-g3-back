import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ChartQueryDto } from './dto/report-query.dto';

@Controller('report')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }
  
  @Post('most-bought-products')
  async getMostBoughtProductsGraph(@Body() body: ChartQueryDto, @Res() res: Response) {
    try {
      const pdfBuffer = await this.reportsService.generateMostBoughtProductsGraph(body);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="most_bought_products.pdf"',
        // 'Content-Length': pdfBuffer.length.toString(),
      });
  
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  @Get('generate-invoice/:id')
  async generateInvoice(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.reportsService.generateInvoice(id);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="purchase_invoice.pdf"',
        // 'Content-Length': pdfBuffer.length.toString(),
      });
  
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  @Post('purchases-per-day')
  async purchasesPerDay(@Body() body: ChartQueryDto, @Res() res: Response) {
    try {
      const pdfBuffer = await this.reportsService.purchasesPerDay(body);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="purchases_pr_day.pdf"',
        // 'Content-Length': pdfBuffer.length.toString(),
      });
  
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }




}
