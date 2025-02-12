import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ChangePasswordRequestDto {
  @ApiProperty({ description: 'Change Password Request' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;
}
