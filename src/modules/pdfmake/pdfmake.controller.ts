import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfmakeService } from './pdfmake.service';
import { ReportsService } from '../chart/reports.service';

@Controller('pdf')
export class PdfController {
    constructor(
        private readonly pdfmakeService: PdfmakeService,
        private readonly reportsService: ReportsService
    ) { }

    @Get('generate')
    async generatePdf(@Res() res: Response) {
        try {
            //   Obtener el gráfico en base64 desde el ReportsService
            const chartBuffer = await this.reportsService.generateMostBoughtProductsGraph({             
                numberProduct: 5,
            });

            // Convertir el Buffer a base64
            const chartBase64 =  chartBuffer.toString('base64');
            
            const chartImage = `data:image/png;base64,${chartBase64}`


            const docDefinition = {
                content: [
                    { text: 'Este es un texto de ejemplo para el PDF generado con pdfmakerrr.', font: 'Arial' },
                    {
                        image: chartImage,
                        width: 500,
                        alignment: 'center',
                        margin: [0, 10, 0, 20],
                      },
                ],
            };


            // Crear el documento PDF
            const pdfDoc = await this.pdfmakeService.createPdf(docDefinition);

            // Configurar la respuesta HTTP
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=Report.pdf');

            // Enviar el PDF como respuesta
            pdfDoc.pipe(res);
            pdfDoc.end();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
