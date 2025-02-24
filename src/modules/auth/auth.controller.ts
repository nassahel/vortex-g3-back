import { Controller, Post, Body, Get } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AuthService } from './auth.service';
import {
  CreateLoginDto,
  CreateRegisterDto,
  RecoveryPasswordDto,
} from './dto/create-auth.dto';
import { SWAGGER_TRANSLATIONS } from 'src/i18n/en/i18n.swagger';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly i18n: I18nService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.AUTH_REGISTER })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.AUTH_REGISTER_SUCCESS })
  register(@Body() createRegisterDto: CreateRegisterDto) {
    return this.authService.register(createRegisterDto);
  }

  @Post('login')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.AUTH_LOGIN })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.AUTH_LOGIN_SUCCESS })
  login(@Body() createLoginDto: CreateLoginDto) {
    return this.authService.login(createLoginDto);
  }

  @Post('request-recovery-password')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.AUTH_REQUEST_RECOVERY_PASSWORD })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.AUTH_REQUEST_RECOVERY_PASSWORD_SUCCESS })
  RequestRecoveryPassword(@Body() body: { email: string }) {
    return this.authService.RequestRecoveryPassword(body.email);
  }

  @Post('recovery-password')
  @ApiOperation({ summary: SWAGGER_TRANSLATIONS.AUTH_RECOVERY_PASSWORD })
  @ApiResponse({ status: 200, description: SWAGGER_TRANSLATIONS.AUTH_RECOVERY_PASSWORD_SUCCESS })
  RecoveryPassword(@Body() recoveryPassword: RecoveryPasswordDto) {
    return this.authService.RecoveryPassword(recoveryPassword);
  }
}
