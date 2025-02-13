import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { UpdateStockDto } from './dto/update-compra.dto';

@Controller('compra')
export class CompraController {
  constructor(private readonly productsService: ProductsService) {}

  @Patch('/actualizar-stock/:id')
  updateStock(@Param('id') id: string, @Body() body: UpdateStockDto) {
    return this.productsService.updateStock(id, body);
  }
  @Patch('/actualizar-stock-productos')
  updateStockAll(@Body() body: UpdateStockDto) {
    return this.productsService.updateStockAll(body);
  }
  @Patch('/incrementar-stock-productos')
  incrementarStockAll(@Body() body: UpdateStockDto) {
    return this.productsService.incrementarStockAll(body);
  }
}
