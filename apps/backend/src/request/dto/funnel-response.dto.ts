/** Valid pipeline step number (1-based). Constrains index arithmetic to known range. */
export type PipelineStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/** One stage's candidate count — snapshot: each candidate counted in exactly one stage. */
export class FunnelStageBreakdownItemDto {
  stepNumber: PipelineStepNumber;
  count: number;
}

/**
 * Conversion rate between two consecutive stages.
 * Historical: a candidate is counted at a stage if they have any result there,
 * regardless of where they currently are in the pipeline.
 * rate is null when no candidates have reached the source stage (not "zero rate").
 */
export class FunnelConversionRateItemDto {
  fromStep: PipelineStepNumber;
  toStep: PipelineStepNumber;
  rate: number | null;
}

/**
 * Interview pass rates per round.
 * Denominator = Pass + Fail only — Saved/Waiting/Cancel are inconclusive results
 * and are excluded from the calculation (Critical Rule 1).
 * null = no concluded interview results at that round yet.
 */
export class FunnelInterviewPassRatesDto {
  interview1: number | null;
  interview2: number | null;
  interview3: number | null;
}

export class FunnelReportDto {
  totalCandidates: number;
  /** Candidates matched to this request but with no pipeline activity yet. */
  pendingCount: number;
  /** Snapshot counts — one entry per stage, sums to totalCandidates - pendingCount. */
  stageBreakdown: FunnelStageBreakdownItemDto[];
  /** Historical conversion rates — 9 consecutive stage pairs. */
  conversionRates: FunnelConversionRateItemDto[];
  interviewPassRates: FunnelInterviewPassRatesDto;
  offerAcceptanceRate: number | null;
  onboardSuccessRate: number | null;
  /** onboarded ÷ totalCandidates. Always a number — 0 when no candidates exist. */
  overallConvRate: number;
}
