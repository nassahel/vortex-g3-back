import {
  IsEmail,
  IsOptional,
  IsString,
  MaxDate,
  MaxLength,
  MinDate,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ProfileDto {
  @ApiPropertyOptional({ description: 'User name' })
  @IsString({ message: i18nValidationMessage('dto.isString') })
  @IsOptional()
  @MinLength(4, { message: i18nValidationMessage('dto.minLength') })
  name: string;

  @ApiPropertyOptional({ description: 'User email' })
  @IsEmail({}, { message: i18nValidationMessage('dto.isEmail') })
  @IsOptional()
  email: string;

  @ApiPropertyOptional({ description: 'User address' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('dto.isString') })
  @MinLength(4, { message: i18nValidationMessage('dto.minLength') })
  @MaxLength(50, { message: i18nValidationMessage('dto.maxLength') })
  address?: string;

  @ApiPropertyOptional({ description: 'User DNI' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('dto.isString') })
  @MinLength(4, { message: i18nValidationMessage('dto.minLength') })
  @MaxLength(15, { message: i18nValidationMessage('dto.maxLength') })
  dni?: string;

  @ApiPropertyOptional({ description: 'User phone number' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('dto.isString') })
  @MinLength(4, { message: i18nValidationMessage('dto.minLength') })
  @MaxLength(15, { message: i18nValidationMessage('dto.maxLength') })
  phone?: string;

  @ApiPropertyOptional({
    description: 'User Date of birth',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @MinDate(new Date('1800-01-01'), {
    message: 'Birthday must be after January 1, 1800',
  })
  @MaxDate(new Date('2025-02-14T23:59:59.999Z'), {
    message: 'Birthday must be before today',
  })
  birthday?: Date;

  @ApiPropertyOptional({ description: 'User profile image' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('dto.isString') })
  profileImage?: string;
}
