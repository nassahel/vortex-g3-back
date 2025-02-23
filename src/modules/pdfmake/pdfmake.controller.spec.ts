import { Test, TestingModule } from '@nestjs/testing';
import { PdfmakeController } from './pdfmake.controller';
import { PdfmakeService } from './pdfmake.service';

describe('PdfmakeController', () => {
  let controller: PdfmakeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfmakeController],
      providers: [PdfmakeService],
    }).compile();

    controller = module.get<PdfmakeController>(PdfmakeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
