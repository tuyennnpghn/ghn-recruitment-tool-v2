import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  MinLength,
} from 'class-validator';

export class PendingRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Lý do pending không được để trống' })
  @MinLength(3)
  pendingReason: string;
}

export class AcceptedOfferDto {
  @IsDateString()
  cddAcceptedOfferDate: string;

  @IsOptional()
  @IsDateString()
  onboardDate?: string;
}
