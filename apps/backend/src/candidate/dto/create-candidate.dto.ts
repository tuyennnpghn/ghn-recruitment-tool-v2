import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsDecimal,
  IsNotEmpty,
  MinLength,
  ValidateIf,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCandidateDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  picId: string;

  // At least one of email or phone is required (validated in service)
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string; // Will be normalized to +84xxxxxxxxx in service

  @IsOptional()
  @IsString()
  sGrade?: string; // S1–S8

  @IsOptional()
  @IsString()
  currentCompany?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  cvLink?: string;

  @IsOptional()
  @IsString()
  cvSourceId?: string;

  @IsOptional()
  @IsBoolean()
  isBlacklisted?: boolean;

  @IsOptional()
  @IsString()
  blacklistReason?: string;

  @IsOptional()
  currentSalary?: number;

  @IsOptional()
  expectedSalary?: number;

  @IsOptional()
  @IsString()
  salaryNote?: string;
}
