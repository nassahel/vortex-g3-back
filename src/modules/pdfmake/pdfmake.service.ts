import { Injectable } from '@nestjs/common';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
const PdfPrinter = require('pdfmake');

@Injectable()
export class PdfmakeService {
  private printer: any; 

  constructor() {    
    this.printer = new PdfPrinter({
      Arial: {
        normal: 'src/assets/fonts/arial.ttf',
        bold: 'src/assets/fonts/arial_narrow.ttf',
        italics: 'src/assets/fonts/arial_italic.ttf',
      },
    });
  }

  async createPdf(docDefinition: TDocumentDefinitions) {
    const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
    return pdfDoc;
  }
}
