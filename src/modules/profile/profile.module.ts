import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { AwsModule } from 'src/aws/aws.module';
import JwtModuleConfig from 'src/config/jwt.config';

@Module({
  imports: [JwtModuleConfig(), AwsModule],
  controllers: [ProfileController],
  providers: [ProfileService]
})
export class ProfileModule { }
