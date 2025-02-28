import type { StyleDictionary, TDocumentDefinitions } from 'pdfmake/interfaces';
import { PrismaService } from 'src/modules/prisma/prisma.service';

const styles: StyleDictionary = {
  header: { fontSize: 22, bold: true, color: '#333' },
  subheader: { fontSize: 12, bold: true, color: '#333' },
  subheader1: { fontSize: 24, bold: true, color: '#333' },
  tableHeader: { fontSize: 10, bold: true, fillColor: '#EDEDED', alignment: 'center' },
  tableCell: { fontSize: 10, margin: [5, 5, 5, 5] },
  totalRow: { bold: true, fontSize: 12, alignment: 'right' },
};

export const invoicePDF = async (purchase): Promise<TDocumentDefinitions> => {
  const prisma = new PrismaService();

  //datos del comprador
  const buyer = await prisma.user.findUnique({
    where: { id: purchase.userId }
  })

  let tableBody = [];

  for (const item of purchase.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId }
    })


    tableBody.push([
      { text: product.name || 'Desconocido', style: 'tableCell' },
      { text: item.quantity.toString(), style: 'tableCell', alignment: 'center' },
      { text: `$${product.price}`, style: 'tableCell', alignment: 'right' },
      { text: `$${(item.quantity * product.price)}`, style: 'tableCell', alignment: 'right' },
    ])
  }

  tableBody.push([
    { text: 'Total', colSpan: 3, style: 'totalRow' }, {}, {},
    { text: `$${purchase.price.toFixed(2)}`, style: 'totalRow' },
  ]);

  return {
    defaultStyle: { fontSize: 10, font: 'Arial', color: '#333' },
    pageSize: 'A4',
    pageMargins: [40, 30, 40, 30],
    content: [
      
      {
        text: `LuxShop`,
        style: 'subheader1',
        margin: [0, 0, 0, 0],
      },
      {
        columns: [
          {
            text: 'Dirección: Nombre Calle 123, Ciudad\nTeléfono: +54 381 123-4567',
            style: 'subheader',
            alignment: 'left',
          },
          {
            text: `Factura N°: ${Math.floor(Math.random() * 100000)}\nFecha de compra: ${purchase.createdAt.toLocaleDateString()}`,
            style: 'subheader',
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, 20],
      },
      {
        text: `Cliente: ${buyer.name}\nDNI: ${'-'}\nDirección: ${'-'}\nMétodo de Pago: ${'-'}`,
        style: 'subheader',
        margin: [0, 0, 0, 20],
      },
      {
        table: {
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Producto', style: 'tableHeader' },
              { text: 'Cantidad', style: 'tableHeader' },
              { text: 'Precio Unitario', style: 'tableHeader' },
              { text: 'Subtotal', style: 'tableHeader' },
            ],
            ...tableBody,
          ],
        },
        layout: 'lightHorizontalLines',
      },
    ],
    styles: styles,
  };
};
