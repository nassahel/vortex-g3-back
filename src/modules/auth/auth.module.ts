import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import JwtModuleConfig from 'src/config/jwt.config';

@Module({
  imports: [JwtModuleConfig(), CacheModule.register()],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
