import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

export class MoveStageDto {
  @IsInt()
  @Min(1)
  @Max(10)
  targetStep: number;

  @IsString()
  @IsOptional()
  note?: string;
}
