import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum Rol {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class CreateUserDto {
  @IsString({ message: 'Image must be a string.' })
  @IsOptional({ message: 'Image is optional.' })
  @MaxLength(200, { message: 'Image cannot be longer than 200 characters.' })
  image: string;

  @IsString({ message: 'Name must be a string.' })
  @MinLength(3, { message: 'Name must be at least 3 characters long.' })
  @MaxLength(100, { message: 'Name cannot be longer than 100 characters.' })
  name: string;

  @IsString({ message: 'Email must be a string.' })
  @MaxLength(50, { message: 'Email cannot be longer than 50 characters.' })
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  email: string;

  @IsEnum(Rol, { message: 'Role must be either ADMIN or USER.' })
  @IsOptional({ message: 'Role is optional.' })
  rol: Rol;

  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password cannot be empty.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @MaxLength(100, { message: 'Password cannot be longer than 100 characters.' })
  password: string;
}
