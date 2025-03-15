import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';  // Importa el decorador ApiProperty
import { i18nValidationMessage } from 'nestjs-i18n';

export enum Rol {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class CreateUserDto {

  @ApiProperty({
    description: 'El nombre del usuario',
    type: String,
    minLength: 3,
    maxLength: 100,
    example: 'Juan Pérez',
  })
  @IsString({ message: i18nValidationMessage('dto.isString') })
  @MinLength(3, { message: i18nValidationMessage('dto.minLength') })
  @MaxLength(100, { message: i18nValidationMessage('dto.maxLength') })
  name: string;

  @ApiProperty({
    description: 'El correo electrónico del usuario',
    type: String,
    maxLength: 50,
    example: 'juan.perez@example.com',
  })
  @IsString({ message: i18nValidationMessage('dto.isString') })
  @MaxLength(50, { message: i18nValidationMessage('dto.maxLength') })
  @IsEmail({}, { message: i18nValidationMessage('dto.isEmail') })
  email: string;

  @ApiProperty({
    description: 'El rol del usuario',
    enum: Rol,
    required: false,
    default: Rol.USER,
    example: Rol.USER,
  })
  @IsEnum(Rol, { message: i18nValidationMessage('dto.rolEnum') })
  @IsOptional({ message: i18nValidationMessage('dto.isOptional') })
  rol: Rol;

  @ApiProperty({
    description: 'La contraseña del usuario (mínimo 8 caracteres)',
    type: String,
    minLength: 8,
    maxLength: 100,
    required: false,
    example: 'password123',
  })
  @IsString({ message: i18nValidationMessage('dto.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.isNotEmpty') })
  @MinLength(8, { message: i18nValidationMessage('dto.minLength') })
  @MaxLength(100, { message: i18nValidationMessage('dto.maxLength') })
  password?: string;
}
