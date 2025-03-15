import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { i18nValidationErrorFactory, i18nValidationMessage } from "nestjs-i18n";

export class CreateChatbotDto {
    @IsString({ message: i18nValidationMessage('dto.isString') })
    @IsNotEmpty({ message: i18nValidationMessage('dto.isNotEmpty') })
    @MinLength(4, { message: i18nValidationMessage('dto.minLenght') })
    @MaxLength(50, { message: i18nValidationMessage('dto.maxLenght') })
    message: string;
}
