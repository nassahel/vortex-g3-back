import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Min } from "class-validator";

export class CreateCartDto {
    @ApiProperty({ description: 'The id of the product' })
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ description: 'The quantity of the product' })
    @IsNotEmpty()
    @Min(1, {message: 'The quantity must be at least 1'})
    quantity: number;
}
