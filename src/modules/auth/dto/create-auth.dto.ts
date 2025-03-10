import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateRegisterDto {
  @ApiProperty({ example: 'usuario123', description: 'Username' })
  @IsString({ message: i18nValidationMessage('dto.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.isNotEmpty') })
  @MaxLength(100, { message: i18nValidationMessage('dto.maxLength') })
  name: string;

  @ApiProperty({ example: 'usuario@example.com', description: 'Email address' })
  @IsString({ message: i18nValidationMessage('dto.isString') })
  @IsEmail({}, { message: i18nValidationMessage('dto.isEmail') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.isNotEmpty') })
  @MaxLength(50, { message: i18nValidationMessage('dto.maxLength') })
  email: string;

  @ApiProperty({ example: 'ContraseñaSegura123', description: 'Password' })
  @IsString({ message: i18nValidationMessage('dto.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.isNotEmpty') })
  @MinLength(8, { message: i18nValidationMessage('dto.minLength') })
  @MaxLength(100, { message: i18nValidationMessage('dto.maxLength') })
  password: string;

  @ApiProperty({ example: 'ContraseñaSegura123', description: 'Confirm Password' })
  @IsString({ message: i18nValidationMessage('dto.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.isNotEmpty') })
  @MinLength(8, { message: i18nValidationMessage('dto.minLength') })
  @MaxLength(100, { message: i18nValidationMessage('dto.maxLength') })
  repeatPassword: string;
}

export class CreateLoginDto {
  @ApiProperty({ example: 'usuario@example.com', description: 'Email address' })
  @IsNotEmpty({ message: i18nValidationMessage('dto.isNotEmpty') })
  @IsEmail({}, { message: i18nValidationMessage('dto.isEmail') })
  @IsString({ message: i18nValidationMessage('dto.isString') })
  email: string;

  @ApiProperty({ example: 'ContraseñaSegura123', description: 'Password' })
  @IsString({ message: i18nValidationMessage('dto.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.isNotEmpty') })
  @MinLength(8, { message: i18nValidationMessage('dto.minLength') })
  @MaxLength(100, { message: i18nValidationMessage('dto.maxLength') })
  password: string;
}

export class RecoveryPasswordDto {
  @ApiProperty({ example: 'NuevaContraseña123', description: 'New password' })
  @IsString({ message: i18nValidationMessage('dto.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.isNotEmpty') })
  @MinLength(8, { message: i18nValidationMessage('dto.minLength') })
  @MaxLength(100, { message: i18nValidationMessage('dto.maxLength') })
  newPassword: string;

  @ApiProperty({ example: 'token12345', description: 'Token for password recovery' })
  @IsString({ message: i18nValidationMessage('dto.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.isNotEmpty') })
  token: string;
}
