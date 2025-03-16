import { Body, Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ChartQueryDto } from './dto/report-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from 'src/common/constants';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('report')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Post('most-bought-products')
  @ApiOperation({ summary: 'Generar gráfico de productos más comprados' })
  @ApiBody({ type: ChartQueryDto }) // Define el request body
  @ApiResponse({
    status: 200,
    description: 'Archivo PDF con el gráfico de productos más comprados',
    content: { 'application/pdf': {} },
  })
  @ApiConsumes('application/json')
  async getMostBoughtProductsGraph(@Body() body: ChartQueryDto, @Res() res: Response) {
    try {
      const pdfBuffer = await this.reportsService.generateMostBoughtProductsGraph(body);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="most_bought_products.pdf"',        
      });

      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  @Get('generate-invoice/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generar factura de compra en PDF' })
  @ApiParam({ name: 'id', example: '123', description: 'ID de la compra' })
  @ApiResponse({
    status: 200,
    description: 'Archivo PDF con la factura de compra',
    content: { 'application/pdf': {} },
  })
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generar informe de compras por día en PDF' })
  @ApiBody({ type: ChartQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Archivo PDF con el informe de compras por día',
    content: { 'application/pdf': {} },
  })
  @ApiConsumes('application/json')
  async purchasesPerDay(@Body() body: ChartQueryDto, @Res() res: Response) {
    try {
      const pdfBuffer = await this.reportsService.purchasesPerDay(body);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="purchases_pr_day.pdf"',
      });

      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
