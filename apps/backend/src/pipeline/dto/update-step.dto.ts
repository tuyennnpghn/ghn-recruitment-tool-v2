import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateStepDto {
  @IsString()
  @IsOptional()
  stepResult?: string;

  @IsDateString()
  @IsOptional()
  stepDate?: string;

  @IsString()
  @IsOptional()
  stepNote?: string;
}
