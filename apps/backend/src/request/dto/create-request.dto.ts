import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum TypeOfRecruitment {
  NEW_HC = 'New HC',
  REPLACEMENT = 'Replacement',
}

export class CreateRequestDto {
  @IsDateString()
  openDate: string; // ISO date string: "2026-05-16"

  @IsUUID()
  departmentId: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  team?: string;

  @IsOptional()
  @IsUUID()
  jobTitleId?: string;

  @IsOptional()
  @IsUUID()
  levelId?: string;

  @IsOptional()
  @IsUUID()
  trackId?: string;

  @IsOptional()
  @IsUUID()
  subTrackId?: string;

  @IsOptional()
  @IsString()
  hiringManager?: string;

  @IsUUID()
  recruiterId: string;

  @IsOptional()
  @IsUUID()
  shared1Id?: string;

  @IsOptional()
  @IsDateString()
  shared1Date?: string;

  @IsOptional()
  @IsUUID()
  shared2Id?: string;

  @IsOptional()
  @IsDateString()
  shared2Date?: string;

  @IsOptional()
  @IsUUID()
  shared3Id?: string;

  @IsOptional()
  @IsDateString()
  shared3Date?: string;

  @IsEnum(TypeOfRecruitment, {
    message: 'typeOfRecruitment phải là "New HC" hoặc "Replacement"',
  })
  typeOfRecruitment: TypeOfRecruitment;

  @IsOptional()
  @IsString()
  replaceFor?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
