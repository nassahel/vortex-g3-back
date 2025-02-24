import { IsBoolean, IsNotEmpty } from 'class-validator';

export class SetPrincipalImageDto {
  @IsNotEmpty()
  @IsBoolean()
  isPrincipal: boolean;
}
