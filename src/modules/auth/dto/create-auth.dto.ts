import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateRegisterDto {
  @ApiProperty({ example: 'usuario123', description: 'Nombre de usuario' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'usuario@example.com', description: 'Correo electrónico' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(50)
  email: string;

  @ApiProperty({ example: 'ContraseñaSegura123', description: 'Contraseña' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'ContraseñaSegura123', description: 'Contraseña' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  repeatPassword: string;
}

export class CreateLoginDto {
  @ApiProperty({ example: 'usuario@example.com', description: 'Correo electrónico' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(50)
  email: string;

  @ApiProperty({ example: 'ContraseñaSegura123', description: 'Contraseña' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password: string;
}

export class RecoveryPasswordDto {
  @ApiProperty({ example: 'usuario@example.com', description: 'Correo electrónico' })
  @IsString()
  newPassword: string;

  @ApiProperty({ example: 'NuevaContraseña123', description: 'Nueva contraseña' })
  @IsString()
  token: string;
}
