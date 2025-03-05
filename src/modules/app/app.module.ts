import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { envVaidationSchema } from 'src/config/configuration';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ProfileModule } from '../profile/profile.module';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';
import { ImagesModule } from '../images/images.module';
import { CartModule } from '../cart/cart.module';
import I18nModuleConfig from 'src/config/i18n.config';
import { ReportsModule } from '../reports/reports.module';
import { PaymentModule } from '../payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validationSchema: envVaidationSchema,
    }),
    I18nModuleConfig(),
    PrismaModule,
    AuthModule,
    UserModule,
    ProfileModule,
    ProductsModule,
    CategoriesModule,
    ImagesModule,
    CartModule,
    ReportsModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
