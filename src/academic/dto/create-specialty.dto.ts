import {IsNotEmpty, IsString, IsOptional, MaxLength} from "class-validator";

export class CreateSpecialtyDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    code: string;

    @IsString()
    @IsOptional()
    description?: string;
}