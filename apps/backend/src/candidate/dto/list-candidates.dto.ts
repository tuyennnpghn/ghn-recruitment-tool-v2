import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumberString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class ListCandidatesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  picId?: string;

  @IsOptional()
  @IsString()
  cvSourceId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isBlacklisted?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeArchived?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 20)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
