import { Injectable, NotFoundException } from '@nestjs/common';
import { ChartService } from './chart.service';
import { ChartQueryDto } from './dto/report-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PrinterService } from '../printer/printer.service';
import { generatePDF } from '../printer/documents/sample.report';
import { generateInvoice } from '../printer/documents/invoice';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chartService: ChartService,
    private readonly printerService: PrinterService,
  ) { }



  async generateMostBoughtProductsGraph(body: ChartQueryDto) {
    const { startDate, endDate, numberProduct } = body;

    // Convertir las fechas a objetos Date si están presentes
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

    // Obtener las órdenes con las condiciones de fechas (si existen)
    const purchases = await this.prisma.order.findMany({
      where: filterConditions, // Aplicamos el filtro de fechas aquí
      include: { items: true },
    });


    if (!purchases || purchases.length === 0) {
      throw new NotFoundException('No se encontraron productos.')
    }

    const products = [];

    for (const purchase of purchases) {
      for (const item of purchase.items) {
        const prod = await this.prisma.product.findUnique({ where: { id: item.productId } });

        if (prod) {
          const existingProduct = products.find(p => p.name === prod.name);

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

    // Ordenar productos por cantidad
    products.sort((a, b) => b.quantity - a.quantity);

    // Limitar los productos a los más vendidos según `numberProduct`
    const topN = numberProduct && !isNaN(Number(numberProduct)) ? Number(numberProduct) : 5;
    const topProducts = products.slice(0, topN);

    // Preparar los datos para el gráfico
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

    // Generar el gráfico
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
    const purchase = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true }
    })




    if (!purchase) {
      throw new NotFoundException('No se encontro la compra')
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
