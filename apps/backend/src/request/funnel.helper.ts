import { PIPELINE_STAGES } from '../pipeline/pipeline.config';
import type {
  FunnelReportDto,
  FunnelStageBreakdownItemDto,
  FunnelConversionRateItemDto,
  FunnelInterviewPassRatesDto,
  PipelineStepNumber,
} from './dto/funnel-response.dto';

// ─── Result string constants ─────────────────────────────────────────────────
// Each string is defined once here and referenced by name in all metric logic.
// This prevents typos in long or unicode-containing strings (especially BCKD).

const RESULT_PASS = 'Pass';
const RESULT_FAIL = 'Fail';
const RESULT_OFFER_ACCEPTED = 'Candidate accept offer';
const RESULT_OFFER_REJECTED = 'Candidate reject offer';
const RESULT_ONBOARDED = 'Onboarded';
// Failed hire: candidate onboarded but left within 7 days — must NOT count as a successful onboard.
// The unicode ≤ (U+2264) must match the exact DB value stored by pipeline.service.ts.
const RESULT_ONBOARD_BCKD = 'Onboarded (BCKD) - Drop ≤ 7D';

// ─── Input types ─────────────────────────────────────────────────────────────
// Matches the Prisma include shape used in RequestService.getFunnelReport:
//   candidateRequest.findMany({ include: { pipelineSteps: { where: { stepResult: { not: null } } } } })

interface StepRecord {
  stepNumber: number;
  stepResult: string | null;
}

interface CandidateRecord {
  pipelineSteps: StepRecord[];
}

// ─── Conversion pair constants ────────────────────────────────────────────────
// Typed at definition — TypeScript enforces valid PipelineStepNumber literals here.
// A value of 0 or 11 is a compile error, not a runtime surprise.
const CONVERSION_PAIRS: Array<{ from: PipelineStepNumber; to: PipelineStepNumber }> = [
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 4, to: 5 },
  { from: 5, to: 6 },
  { from: 6, to: 7 },
  { from: 7, to: 8 },
  { from: 8, to: 9 },
  { from: 9, to: 10 },
];

// ─── Guards and utilities ─────────────────────────────────────────────────────

/**
 * Runtime range guard before TypeScript narrowing.
 * Every computed number must pass this check before becoming a PipelineStepNumber.
 * Prevents blind casts and guards against PIPELINE_STAGES being extended unexpectedly.
 */
export function isValidStepNumber(n: number): n is PipelineStepNumber {
  return Number.isInteger(n) && n >= 1 && n <= 10;
}

/** Returns the highest stepNumber that has a recorded result. Snapshot semantics. */
function latestCompletedStep(steps: StepRecord[]): PipelineStepNumber | null {
  const withResults = steps.filter((s) => s.stepResult !== null);
  if (withResults.length === 0) return null;

  const latest = withResults.reduce(
    (max, s) => (s.stepNumber > max ? s.stepNumber : max),
    0,
  );

  if (!isValidStepNumber(latest)) {
    throw new Error(
      `Unexpected step number ${latest} in pipeline data — expected 1–10.`,
    );
  }
  return latest;
}

/** Returns the recorded result at a given step, or null if the candidate never reached it. */
function resultAt(steps: StepRecord[], stepNumber: PipelineStepNumber): string | null {
  return steps.find((s) => s.stepNumber === stepNumber)?.stepResult ?? null;
}

/**
 * Historical semantics: true if the candidate has any recorded result at this step.
 * Used to determine whether a candidate "entered" or "converted" at a given stage.
 */
function hasResultAt(steps: StepRecord[], stepNumber: PipelineStepNumber): boolean {
  return steps.some((s) => s.stepNumber === stepNumber && s.stepResult !== null);
}

/**
 * Returns null when denominator is 0 — meaning no candidates reached this stage yet.
 * This is distinct from a genuine 0% rate (denominator > 0, numerator = 0).
 */
function safeRate(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : numerator / denominator;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function computeFunnelReport(rows: CandidateRecord[]): FunnelReportDto {
  const totalCandidates = rows.length;

  // ── Stage breakdown (snapshot) ───────────────────────────────────────────
  // Each candidate is counted in exactly ONE stage: their latestCompletedStep.
  // Candidates with no completed steps have no pipeline activity yet — "pending".
  const snapshotCounts = new Array<number>(10).fill(0);
  let pendingCount = 0;

  for (const row of rows) {
    const latest = latestCompletedStep(row.pipelineSteps);
    if (latest === null) {
      pendingCount++;
    } else {
      snapshotCounts[latest - 1]++;
    }
  }

  const stageBreakdown: FunnelStageBreakdownItemDto[] = PIPELINE_STAGES.map((_, idx) => {
    const stepNumber = idx + 1;
    // Guard against PIPELINE_STAGES being extended beyond 10 without updating this helper.
    if (!isValidStepNumber(stepNumber)) {
      throw new Error(
        `PIPELINE_STAGES produced step number ${stepNumber} — expected 1–10. Update funnel.helper.ts.`,
      );
    }
    return { stepNumber, count: snapshotCounts[idx] };
  });

  // ── Conversion rates (historical) ────────────────────────────────────────
  // A candidate is counted at a stage if they have any result there.
  // "entered" and "converted" are internal — only rate is exposed in the DTO.
  const conversionRates: FunnelConversionRateItemDto[] = CONVERSION_PAIRS.map(
    ({ from, to }) => {
      const entered = rows.filter((r) => hasResultAt(r.pipelineSteps, from)).length;
      const converted = rows.filter((r) => hasResultAt(r.pipelineSteps, to)).length;
      return { fromStep: from, toStep: to, rate: safeRate(converted, entered) };
    },
  );

  // ── Interview pass rates (historical) ────────────────────────────────────
  // Critical Rule 1: denominator = Pass + Fail ONLY.
  // Saved, Waiting, and Cancel are inconclusive — excluding them prevents
  // in-progress or cancelled interviews from deflating the pass rate.
  function interviewPassRate(stepNumber: PipelineStepNumber): number | null {
    let pass = 0;
    let fail = 0;
    for (const row of rows) {
      const result = resultAt(row.pipelineSteps, stepNumber);
      if (result === RESULT_PASS) pass++;
      else if (result === RESULT_FAIL) fail++;
    }
    return safeRate(pass, pass + fail);
  }

  const interviewPassRates: FunnelInterviewPassRatesDto = {
    interview1: interviewPassRate(6),
    interview2: interviewPassRate(7),
    interview3: interviewPassRate(8),
  };

  // ── Offer acceptance rate (historical) ───────────────────────────────────
  // Denominator = accepted + rejected only.
  // Waiting results are excluded — the offer outcome is not yet decided.
  let offerAccepted = 0;
  let offerRejected = 0;
  for (const row of rows) {
    const result = resultAt(row.pipelineSteps, 9);
    if (result === RESULT_OFFER_ACCEPTED) offerAccepted++;
    else if (result === RESULT_OFFER_REJECTED) offerRejected++;
  }
  const offerAcceptanceRate = safeRate(offerAccepted, offerAccepted + offerRejected);

  // ── Onboard success rate (historical) ────────────────────────────────────
  // Critical Rule 3: RESULT_ONBOARD_BCKD is a failed hire — must NOT count as success,
  // even though pipeline.config.ts assigns it type 'completed' (same as RESULT_ONBOARDED).
  // Only the exact string 'Onboarded' is a successful onboard.
  // Denominator = all candidates who have any result at step 10 (reached onboard stage).
  let onboardSuccess = 0;
  let onboardTotal = 0;
  for (const row of rows) {
    const result = resultAt(row.pipelineSteps, 10);
    if (result !== null) {
      onboardTotal++;
      if (result === RESULT_ONBOARDED) onboardSuccess++;
    }
  }
  const onboardSuccessRate = safeRate(onboardSuccess, onboardTotal);

  // ── Overall conversion rate ───────────────────────────────────────────────
  // Successful onboards ÷ all matched candidates.
  // Returns 0 (not null) when the request has no candidates — it is simply empty.
  const onboardedCount = rows.filter(
    (r) => resultAt(r.pipelineSteps, 10) === RESULT_ONBOARDED,
  ).length;
  const overallConvRate =
    totalCandidates === 0 ? 0 : onboardedCount / totalCandidates;

  return {
    totalCandidates,
    pendingCount,
    stageBreakdown,
    conversionRates,
    interviewPassRates,
    offerAcceptanceRate,
    onboardSuccessRate,
    overallConvRate,
  };
}
