import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateLoginDto,
  CreateRegisterDto,
  RecoveryPasswordDto,
} from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createRegisterDto: CreateRegisterDto) {
    return this.authService.register(createRegisterDto);
  }

  @Post('login')
  login(@Body() createLoginDto: CreateLoginDto) {
    return this.authService.login(createLoginDto);
  }

  @Post('request-recovery-password')
  RequestRecoveryPassword(@Body() body: { email: string }) {
    return this.authService.RequestRecoveryPassword(body.email);
  }

  @Post('recovery-password')
  RecoveryPassword(@Body() recoveryPassword: RecoveryPasswordDto) {
    return this.authService.RecoveryPassword(recoveryPassword);
  }
}
