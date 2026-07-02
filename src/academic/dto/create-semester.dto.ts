import { IsString, IsOptional, IsInt, Min, Max, IsIn} from 'class-validator';

export class CreateSemesterDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(6)
    level?: number;

    @IsString()
    academicPeriod: string;

    @IsOptional()
    @IsIn(['regular', 'recovery', 'intersemester'])
    type?: 'regular' | 'recovery' | 'intersemester';
}