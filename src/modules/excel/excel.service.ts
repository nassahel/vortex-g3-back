import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

@Injectable()
export class ExcelService {
  readExcel(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    //se obtiene el nombre de la hoja
    const name = workbook.SheetNames[0];
    const hoja = workbook.Sheets[name];
    //se convierten los datos a json
    const datos = XLSX.utils.sheet_to_json(hoja, { defval: null });
    return datos;
  }
}
