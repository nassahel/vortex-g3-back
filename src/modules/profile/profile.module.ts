import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { AwsModule } from 'src/aws/aws.module';
import JwtModuleConfig from 'src/config/jwt.config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [JwtModuleConfig(), AwsModule, AuthModule],
  controllers: [ProfileController],
  providers: [ProfileService]
})
export class ProfileModule { }
