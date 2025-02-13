import { Test, TestingModule } from '@nestjs/testing';
import { CompraController } from './compra.controller';
import { CompraService } from './compra.service';

describe('CompraController', () => {
  let controller: CompraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompraController],
      providers: [CompraService],
    }).compile();

    controller = module.get<CompraController>(CompraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
