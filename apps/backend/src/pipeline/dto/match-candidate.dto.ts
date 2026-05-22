import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class MatchCandidateDto {
  @IsString()
  @IsNotEmpty()
  candidateId: string;

  @IsString()
  @IsNotEmpty()
  requestId: string;

  @IsString()
  @IsOptional()
  note?: string;
}
