import { Injectable, NotFoundException } from '@nestjs/common';
import { ChartService } from 'src/modules/chart/chart.service';
import { PrinterService } from 'src/modules/printer/printer.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ChartQueryDto } from './dto/report-query.dto';
import { generatePDF } from 'src/modules/printer/documents/report';
import { generateInvoice } from 'src/modules/printer/documents/invoice';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chartService: ChartService,
    private readonly printerService: PrinterService,
  ) {}

  async generateMostBoughtProductsGraph(body: ChartQueryDto) {
    const { startDate, endDate, numberProduct } = body;

    const filterConditions = {};

    if (startDate) {
      filterConditions['createdAt'] = { gte: new Date(startDate) };
    }

    if (endDate) {
      filterConditions['createdAt'] = {
        ...filterConditions['createdAt'],
        lte: new Date(endDate),
      };
    }

    const purchases = await this.prisma.cart.findMany({
      where: filterConditions,
      include: { items: true },
    });

    if (!purchases || purchases.length === 0) {
      throw new NotFoundException('No se encontraron productos.');
    }

    const products = [];

    for (const purchase of purchases) {
      for (const item of purchase.items) {
        const prod = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (prod) {
          const existingProduct = products.find((p) => p.name === prod.name);

          if (existingProduct) {
            existingProduct.quantity += item.quantity;
          } else {
            products.push({
              name: prod.name,
              quantity: item.quantity,
              price: prod.price,
            });
          }
        }
      }
    }

    products.sort((a, b) => b.quantity - a.quantity);
    const topN = numberProduct && !isNaN(Number(numberProduct)) ? Number(numberProduct) : 5;
    const topProducts = products.slice(0, topN);

    const labelsData = topProducts.map(product => product.name);
    const dataOfData = topProducts.map(product => product.quantity);

    const mockData = {
      labels: labelsData,
      datasets: [
        {
          label: 'Productos más vendidos',
          data: dataOfData,
          backgroundColor: ['red', 'blue', 'green'],
        },
      ],
    };

    const chartBuffer = await this.chartService.generateChart('bar', mockData);
    const pdfDefinition = await generatePDF(chartBuffer);
    const pdfDoc = await this.printerService.createPdf(pdfDefinition);
    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }

  async getPurchasesGraph(id: string) {
    const purchase = await this.prisma.cart.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!purchase) {
      throw new NotFoundException('No se encontro la compra');
    }

    const pdfDefinition = await generateInvoice(purchase);
    const pdfDoc = await this.printerService.createInvoice(pdfDefinition);

    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }
}
