import {
  IsOptional,
  IsString,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum RequestStatus {
  OPENING = 'Opening',
  PENDING = 'Pending',
  ACCEPTED_OFFER = 'Accepted offer',
  DONE = 'Done',
  CLOSE = 'Close',
}

export class ListRequestsDto {
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  recruiterId?: string;

  /** Filter by month: "2026-05" */
  @IsOptional()
  @IsString()
  month?: string;

  /** Search by requestNo or jobTitle name */
  @IsOptional()
  @IsString()
  search?: string;

  /** Sort field */
  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  /** Include archived (admin only) */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeArchived?: boolean = false;
}
