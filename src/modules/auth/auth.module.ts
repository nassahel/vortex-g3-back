import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import JwtModuleConfig from 'src/config/jwt.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MessageModule } from '../messages/messages.module';

@Module({
  imports: [JwtModuleConfig(), MessageModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule { }
