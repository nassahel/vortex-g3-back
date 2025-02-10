import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

@Injectable()
export class ExcelService {
  async readExcel(buffer: Buffer, columnsRequired: string[]) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    //se obtiene el nombre de la hoja
    const name = workbook.SheetNames[0];
    const hoja = workbook.Sheets[name];
    //se convierten los datos a json
    const datos = XLSX.utils.sheet_to_json(hoja, { defval: null });

    // Validamos que el archivo tenga contenido
    if (!datos.length) {
      throw new BadRequestException('El archivo Excel está vacío.');
    }

    // Obtenemos las claves (nombres de columnas) de la primera fila
    const columnasArchivo = Object.keys(datos[0]);

    // Obtenemos las columnas que faltan
    const columnasFaltantes = columnsRequired.filter(
      (col) => !columnasArchivo.includes(col),
    );

    if (columnasFaltantes.length > 0) {
      throw new BadRequestException(
        `El archivo no contiene las columnas obligatorias`,
      );
    }

    return datos;
  }
}
