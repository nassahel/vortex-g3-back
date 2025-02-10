import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CheckoutCartDto {
    @ApiPropertyOptional( { description: 'Address where the order will be delivered' })
    @IsOptional()
    @IsString()
    shippingAddress?: string;
}