import { IsNotEmpty, IsString } from 'class-validator';

export class CreateImageDto {
  @IsString()
  @IsNotEmpty()
  idProduct: string;

  @IsString()
  @IsNotEmpty()
  image: Express.Multer.File;

  @IsString()
  @IsNotEmpty()
  altText: string;
}
