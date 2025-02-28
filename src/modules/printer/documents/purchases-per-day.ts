import type { StyleDictionary, TDocumentDefinitions } from 'pdfmake/interfaces';
const styles: StyleDictionary = {
  header: {
    fontSize: 20,
    bold: true,
    color: '#2C3E50',
    alignment: 'center',
    margin: [0, 20, 0, 10],
  },
  subheader: {
    fontSize: 12,
    bold: true,
    color: '#34495E',
    margin: [0, 10, 0, 5],
  },
  footer: {
    fontSize: 9,
    color: '#7F8C8D',
    alignment: 'center',
    margin: [0, 30, 0, 0],
  },
};

export const purchasesPerDayPDF = async (
  chartBuffer: Buffer,
): Promise<TDocumentDefinitions> => {
  const chartBase64 = chartBuffer.toString('base64');
  const chartImage = `data:image/png;base64,${chartBase64}`;

  return {
    defaultStyle: {
      fontSize: 10,
      font: 'Arial',
      characterSpacing: -0.5,
      color: '#43484C',
    },
    pageSize: 'A4',
    pageMargins: [40, 50, 40, 60], // Márgenes mejorados
    header: () => ({
      stack: [
        {
          text: 'LuxShop',
          bold: true,
          fontSize: 22,
          color: '#2C3E50',
          alignment: 'center',
          margin: [0, 20, 0, 5],
        },
        {
          text: 'Reporte de Compras por Día',
          style: 'header',
        },
      ],
    }),
    footer: (currentPage, pageCount) => ({
      columns: [
        {
          text: `Página ${currentPage} de ${pageCount}`,
          style: 'footer',
        },
        {
          text: 'Gracias por confiar en LuxShop - Tu estilo, tu esencia.',
          style: 'footer',
          alignment: 'right',
        },
      ],
      margin: [40, 0, 40, 30],
    }),
    content: [
      {
        text: `Fecha del reporte: ${new Date().toLocaleDateString()}`,
        style: 'subheader',
      },
      {
        text: 'Este informe muestra la cantidad de compras realizadas por día en LuxShop.',
        style: 'text',
      },
      {
        image: chartImage,
        width: 450,
        alignment: 'center',
        margin: [0, 15, 0, 25],
      },
    ],
    styles: styles,
  };
};
