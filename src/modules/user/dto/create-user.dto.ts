import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export enum Rol {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class CreateUserDto {
  @IsString({ message: i18nValidationMessage('dto.isString') })
  @IsOptional({ message: i18nValidationMessage('dto.isOptional') })
  @MaxLength(200, { message: i18nValidationMessage('dto.maxLength') })
  image: string;

  @IsString({ message: i18nValidationMessage('dto.isString') })
  @MinLength(3, { message: i18nValidationMessage('dto.minLength') })
  @MaxLength(100, { message: i18nValidationMessage('dto.maxLength') })
  name: string;

  @IsString({ message: i18nValidationMessage('dto.isString') })
  @MaxLength(50, { message: i18nValidationMessage('dto.maxLength') })
  @IsEmail({}, { message: i18nValidationMessage('dto.isEmail') })
  email: string;

  @IsEnum(Rol, { message: i18nValidationMessage('dto.rolEnum') })
  @IsOptional({ message: i18nValidationMessage('dto.isOptional') })
  rol: Rol;

  @IsString({ message: i18nValidationMessage('dto.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.isNotEmpty') })
  @MinLength(8, { message: i18nValidationMessage('dto.minLength') })
  @MaxLength(100, { message: i18nValidationMessage('dto.maxLength') })
  password: string;
}
