import { Test, TestingModule } from '@nestjs/testing';
import { PdfmakeService } from './pdfmake.service';

describe('PdfmakeService', () => {
  let service: PdfmakeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfmakeService],
    }).compile();

    service = module.get<PdfmakeService>(PdfmakeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
