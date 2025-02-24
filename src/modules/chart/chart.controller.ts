import { Controller, Get, Query, Res } from '@nestjs/common';
import { ChartService } from './chart.service';
import { Response } from 'express';

@Controller('chart')
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @Get()
  async getChart(@Query('type') type: string, @Res() res: Response) {
    try {
      const chartBuffer = await this.chartService.generateChart(
        type as any,
        {
          labels: ['Enero', 'Febrero', 'Marzo'],
          datasets: [
            {
              label: 'Ventas',
              data: [100, 200, 300],
              backgroundColor: ['red', 'blue', 'green'],
            },
          ],
        },
        {
          responsive: false,
        },
      );

      res.setHeader('Content-Type', 'image/png');
      res.send(chartBuffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
