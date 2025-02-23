import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ChartQueryDto } from './dto/report-query-dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }
  
  @Post('most-bought-products')
  async getMostBoughtProductsGraph(@Body() body: ChartQueryDto, @Res() res: Response) {
    try {
      const chartBuffer = await this.reportsService.generateMostBoughtProductsGraph(body);
      res.setHeader('Content-Type', 'image/png');
      res.send(chartBuffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  @Get('purchases')
  async getPurchasesGraph(@Body() body: ChartQueryDto, @Res() res: Response) {
    try {
      const chartBuffer = await this.reportsService.generatePurchasesGraph(body);
      res.setHeader('Content-Type', 'image/png');
      res.send(chartBuffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
