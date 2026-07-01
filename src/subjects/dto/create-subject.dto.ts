import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  credits?: number;

  @IsOptional()
  @IsUUID()
  specialtyId?: string;
  if (specialtyId !== undefined) {
  const specialty = await this.specialtyRepository.findOne({
    where: { id: specialtyId },
  });

  if (!specialty) {
    throw new NotFoundException(
      'La especialidad no existe.',
    );
  }

  subject.specialty = specialty;
}
}