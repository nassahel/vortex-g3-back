import { IsBoolean, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class SetPrincipalImageDto {
  @IsNotEmpty({message: i18nValidationMessage('dto.isNotEmpty')})
  @IsBoolean({ message: i18nValidationMessage('dto.isBoolean') })
  isPrincipal: boolean;
}
