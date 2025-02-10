import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Min } from "class-validator";

export class UpdateCartItemDto {
    @ApiProperty({ description: 'New quantity of the product' })
    @IsInt()
    @Min(1, {message: 'The quantity must be at least 1'})
    quantity: number;
}
