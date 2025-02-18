// async generatePurchaseBarChart(): Promise<Buffer> {
//     // Obtiene todas las compras de la base de datos, seleccionando solo id, totalAmount y createdAt, ordenadas por fecha (ascendente)
//     const purchases = await this.prisma.purchase.findMany({
//       select: { id: true, totalAmount: true, createdAt: true },
//       orderBy: { createdAt: 'asc' },
//     });
    
//     // Ejemplo de lo que podría devolver 'purchases':
//     // [
//     //   { id: 1, totalAmount: 150, createdAt: '2025-01-01T10:00:00Z' },
//     //   { id: 2, totalAmount: 200, createdAt: '2025-01-02T10:00:00Z' },
//     //   { id: 3, totalAmount: 300, createdAt: '2025-01-01T15:00:00Z' },
//     //   { id: 4, totalAmount: 100, createdAt: '2025-01-02T12:00:00Z' },
//     // ]
  
//     // Crea un objeto para almacenar el monto total de compras agrupado por fecha
//     const groupedByDate = {};
  
//     // Agrupa las compras por fecha, sumando los montos de las compras en cada fecha
//     purchases.forEach((purchase) => {
//       // Formatea la fecha (solo fecha, sin hora) a formato 'YYYY-MM-DD'
//       const date = purchase.createdAt.toISOString().split('T')[0];
      
//       // Ejemplo de fecha formateada: '2025-01-01', '2025-01-02'
  
//       // Si no existe una entrada para esta fecha, inicializa el monto a 0
//       if (!groupedByDate[date]) {
//         groupedByDate[date] = 0;
//       }
      
//       // Suma el monto de la compra al total de la fecha correspondiente
//       groupedByDate[date] += Number(purchase.totalAmount);
      
//       // Ejemplo después de este paso:
//       // groupedByDate = {
//       //   '2025-01-01': 450,  // (150 + 300)
//       //   '2025-01-02': 300   // (200 + 100)
//       // }
//     });
  
//     // Extrae las fechas como las etiquetas del gráfico
//     const labels = Object.keys(groupedByDate);
    
//     // Ejemplo de 'labels': ['2025-01-01', '2025-01-02']
  
//     // Extrae los montos totales de compras por fecha
//     const data = Object.values(groupedByDate);
  
//     // Ejemplo de 'data': [450, 300]
  
//     // Crea el objeto de datos para el gráfico de barras
//     const chartData = {
//       labels, // Fechas como etiquetas en el gráfico
//       datasets: [
//         {
//           label: 'Monto Total de Compras', // Nombre del dataset
//           data, // Montos totales de compras para cada fecha
//           backgroundColor: '#36A2EB', // Color de fondo de las barras
//         },
//       ],
//     };
  
//     // Configuración del gráfico
//     const chartOptions: ChartConfiguration['options'] = {
//       responsive: true, // Hace que el gráfico sea responsive
//       plugins: {
//         legend: { position: 'top' }, // Muestra la leyenda en la parte superior
//         title: {
//           display: true, // Muestra el título
//           text: 'Compras por Fecha', // Título del gráfico
//         },
//       },
//     };
  
//     // Llama a ChartService para generar el gráfico de barras con los datos y las opciones configuradas
//     const chartBuffer = await this.chartService.generateChart(
//       'bar', // Tipo de gráfico: barras
//       chartData, // Datos del gráfico
//       chartOptions, // Opciones de configuración del gráfico
//     );
  
//     // Ejemplo de lo que contiene 'chartBuffer':
//     // Buffer con los datos binarios de la imagen del gráfico de barras generado (en formato PNG)
  
//     // Genera un PDF con el gráfico creado
//     const pdfDefinition = await generatePDF(chartBuffer);
  
//     // Crea el documento PDF usando el servicio de impresora
//     const pdfDoc = await this.printerService.createPdf(pdfDefinition);
  
//     // Convierte el documento PDF a un Buffer y lo devuelve
//     return new Promise((resolve, reject) => {
//       const chunks: Uint8Array[] = [];
//       // Escucha los datos del PDF y los agrega a los chunks
//       pdfDoc.on('data', (chunk) => chunks.push(chunk));
//       // Cuando el PDF esté listo, concatena todos los chunks y lo resuelve como un único Buffer
//       pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
//       // Si ocurre un error, lo rechaza
//       pdfDoc.on('error', reject);
//       // Termina la creación del PDF
//       pdfDoc.end();
//     });
//   }
  