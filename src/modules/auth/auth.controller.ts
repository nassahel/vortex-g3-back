import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateLoginDto, CreateRegisterDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() createRegisterDto: CreateRegisterDto) {
    return this.authService.register(createRegisterDto);
  }

  @Post('login')
  login(@Body() createLoginDto: CreateLoginDto) {
    return this.authService.login(createLoginDto);
  }


}
