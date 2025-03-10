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
  @MinLength(1, { message: 'Name must not be empty' })
  name: string;

  @ApiPropertyOptional({ description: 'User email' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsOptional()
  email: string;

  @ApiPropertyOptional({ description: 'User address' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Address must not be empty' })
  @MaxLength(50, { message: 'Address must not exceed 20 characters' })
  address?: string;

  @ApiPropertyOptional({ description: 'User DNI' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'DNI must not be empty' })
  @MaxLength(15, { message: 'DNI must not exceed 15 characters' })
  dni?: string;

  @ApiPropertyOptional({ description: 'User phone number' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Phone must not be empty' })
  @MaxLength(15, { message: 'Phone must not exceed 15 characters' })
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
  @IsString()
  profileImage?: string;
}
