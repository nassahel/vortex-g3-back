import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ExcelModule } from '../excel/excel.module';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [ExcelModule, AwsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
