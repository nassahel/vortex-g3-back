import { Test, TestingModule } from '@nestjs/testing';
import { CompraService } from './compra.service';

describe('CompraService', () => {
  let service: CompraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompraService],
    }).compile();

    service = module.get<CompraService>(CompraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
