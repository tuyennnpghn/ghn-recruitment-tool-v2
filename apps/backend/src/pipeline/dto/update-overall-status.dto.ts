import { IsString, IsNotEmpty, IsIn } from 'class-validator';

const OVERALL_STATUSES = [
  'In Progress',
  'Offer',
  'Onboarded',
  'Closed',
  'On Hold',
] as const;

export class UpdateOverallStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(OVERALL_STATUSES)
  overallStatus: string;
}
