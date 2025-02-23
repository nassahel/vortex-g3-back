import { PartialType } from '@nestjs/swagger';
import { CreatePdfmakeDto } from './create-pdfmake.dto';

export class UpdatePdfmakeDto extends PartialType(CreatePdfmakeDto) {}
