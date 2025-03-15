import type { StyleDictionary, TDocumentDefinitions } from 'pdfmake/interfaces';

const styles: StyleDictionary = {
  header: {
    fontSize: 18,
    bold: true,
    color: '#2C3E50',
    alignment: 'center',
  },
  subheader: {
    fontSize: 12,
    bold: true,
    color: '#34495E',
    margin: [0, 10, 0, 5],
  },
  tableHeader: {
    fontSize: 10,
    bold: true,
    color: '#FFF',
    fillColor: '#2C3E50', 
    alignment: 'center',
  },
  text: {
    fontSize: 10,
    color: '#43484C',
    margin: [0, 5, 0, 5],
  },
  footer: {
    fontSize: 9,
    color: '#7F8C8D',
    alignment: 'center',
    margin: [0, 30, 0, 0],
  },
};

export const productsMostBoughtPDF = async (
  chartBuffer: Buffer,
): Promise<TDocumentDefinitions> => {
  const chartBase64 = chartBuffer.toString('base64');
  const chartImage = `data:image/png;base64,${chartBase64}`;



  return {
    defaultStyle: {
      fontSize: 10,
      font: 'Arial',
      characterSpacing: -0.3,
      color: '#43484C',
    },
    pageSize: 'A4',
    pageMargins: [40, 50, 40, 60], 
    header: () => {
      return [
        {
          text: 'LuxShop',
          bold: true,
          fontSize: 24,  
          color: '#2C3E50', 
          alignment: 'left',
          margin: [40, 20, 0, 10], 
        },
        {
          text: 'Reporte de Productos Más Vendidos',
          fontSize: 14,
          bold: true,
          alignment: 'right',
          margin: [0, -30, 40, 10],  
        },
      ];
    },
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
        text: 'Este informe muestra los productos con mayor demanda en LuxShop.',
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
