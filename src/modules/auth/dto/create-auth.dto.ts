import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, minLength } from "class-validator";


export class CreateRegisterDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(50)
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(100)
    password: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(100)
    repeatPassword: string;
}



export class CreateLoginDto {

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(50)
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    password: string;
}


export class RecoveryPasswordDto {
    @IsString()
    newPassword: string;

    @IsString()
    token: string;
}
