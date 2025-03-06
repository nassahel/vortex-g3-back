import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateRegisterDto {
  @ApiProperty({ example: 'usuario123', description: 'Username' })
  @IsString({ message: 'The username must be a string.' })
  @IsNotEmpty({ message: 'The username is required.' })
  @MaxLength(100, { message: 'The username must be at most 100 characters long.' })
  name: string;

  @ApiProperty({ example: 'usuario@example.com', description: 'Email address' })
  @IsString({ message: 'The email must be a string.' })
  @IsEmail({}, { message: 'The email must be a valid email address.' })
  @IsNotEmpty({ message: 'The email is required.' })
  @MaxLength(50, { message: 'The email must be at most 50 characters long.' })
  email: string;

  @ApiProperty({ example: 'ContraseñaSegura123', description: 'Password' })
  @IsString({ message: 'The password must be a string.' })
  @IsNotEmpty({ message: 'The password is required.' })
  @MinLength(8, { message: 'The password must be at least 8 characters long.' })
  @MaxLength(100, { message: 'The password must be at most 100 characters long.' })
  password: string;

  @ApiProperty({ example: 'ContraseñaSegura123', description: 'Confirm Password' })
  @IsString({ message: 'The confirmation password must be a string.' })
  @IsNotEmpty({ message: 'The confirmation password is required.' })
  @MinLength(8, { message: 'The confirmation password must be at least 8 characters long.' })
  @MaxLength(100, { message: 'The confirmation password must be at most 100 characters long.' })
  repeatPassword: string;
}

export class CreateLoginDto {
  @ApiProperty({ example: 'usuario@example.com', description: 'Email address' })
  @IsString({ message: 'The email must be a string.' })
  @IsEmail({}, { message: 'The email must be a valid email address.' })
  @IsNotEmpty({ message: 'The email is required.' })
  @MaxLength(50, { message: 'The email must be at most 50 characters long.' })
  email: string;

  @ApiProperty({ example: 'ContraseñaSegura123', description: 'Password' })
  @IsString({ message: 'The password must be a string.' })
  @IsNotEmpty({ message: 'The password is required.' })
  @MaxLength(100, { message: 'The password must be at most 100 characters long.' })
  password: string;
}

export class RecoveryPasswordDto {
  @ApiProperty({ example: 'usuario@example.com', description: 'Email address' })
  @IsString({ message: 'The email must be a string.' })
  newPassword: string;

  @ApiProperty({ example: 'NuevaContraseña123', description: 'New password' })
  @IsString({ message: 'The token must be a string.' })
  token: string;
}
