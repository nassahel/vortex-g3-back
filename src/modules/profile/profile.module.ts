import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import JwtModuleConfig from 'src/config/jwt.config';
import { AuthModule } from '../auth/auth.module';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [JwtModuleConfig(), AwsModule, AuthModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
