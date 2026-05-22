import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { TypeOfRecruitment } from './create-request.dto';

export class UpdateRequestDto {
  @IsOptional()
  @IsDateString()
  openDate?: string;

  @IsOptional()
  @IsUUID()
  jobTitleId?: string;

  @IsOptional()
  @IsUUID()
  levelId?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  team?: string;

  @IsOptional()
  @IsUUID()
  trackId?: string;

  @IsOptional()
  @IsUUID()
  subTrackId?: string;

  @IsOptional()
  @IsString()
  hiringManager?: string;

  @IsOptional()
  @IsUUID()
  recruiterId?: string;

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

  @IsOptional()
  @IsEnum(TypeOfRecruitment)
  typeOfRecruitment?: TypeOfRecruitment;

  @IsOptional()
  @IsString()
  replaceFor?: string;

  @IsOptional()
  @IsDateString()
  cddAcceptedOfferDate?: string;

  @IsOptional()
  @IsDateString()
  onboardDate?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
