import { Injectable } from '@nestjs/common';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
const PdfPrinter = require('pdfmake'); 

@Injectable()
export class PrinterService {
  private printer: any;

  constructor() {
    const fonts = {
      Arial: {
        normal: 'src/assets/fonts/arial.ttf',
        bold: 'src/assets/fonts/arial_narrow.ttf',
        italics: 'src/assets/fonts/arial_italic.ttf',
        bolditalics: 'src/assets/fonts/arial_narrow.ttf',
        600: 'src/assets/fonts/arial_narrow.ttf',
      },
    };
    this.printer = new PdfPrinter(fonts);
  }

  async createPdf(docDefinition: TDocumentDefinitions) {
    return this.printer.createPdfKitDocument(docDefinition);
  }



  async createInvoice(docDefinition: TDocumentDefinitions) {
    return this.printer.createPdfKitDocument(docDefinition);
  }
}