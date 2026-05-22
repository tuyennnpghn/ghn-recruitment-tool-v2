import { computeFunnelReport, isValidStepNumber } from './funnel.helper';

// ─── Local types matching funnel.helper.ts internal interfaces ────────────
// The helper does not export its input types; we replicate them here.

interface StepRecord {
  stepNumber: number;
  stepResult: string | null;
}

interface CandidateRecord {
  pipelineSteps: StepRecord[];
}

function step(stepNumber: number, stepResult: string): StepRecord {
  return { stepNumber, stepResult };
}

// ─── Gate 3 approved dataset — 10 candidates ─────────────────────────────
// Named for each candidate's most distinctive result.

const C1_PENDING: CandidateRecord = { pipelineSteps: [] };

const C2_STEP1: CandidateRecord = {
  pipelineSteps: [step(1, 'Not open for new job')],
};

const C3_STEP3: CandidateRecord = {
  pipelineSteps: [
    step(1, 'Open to process with GHN'),
    step(2, 'Contact'),
    step(3, 'Not fit'),
  ],
};

const C4_IV1_FAIL: CandidateRecord = {
  pipelineSteps: [
    step(1, 'Open to process with GHN'),
    step(2, 'Contact'),
    step(3, 'CV fit and continue to process'),
    step(4, 'Sent'),
    step(5, 'Qualified'),
    step(6, 'Fail'),
  ],
};

const C5_IV1_SAVED: CandidateRecord = {
  pipelineSteps: [
    step(1, 'Open to process with GHN'),
    step(2, 'Contact'),
    step(3, 'CV fit and continue to process'),
    step(4, 'Sent'),
    step(5, 'Qualified'),
    step(6, 'Saved'),
  ],
};

const C6_IV1_CANCEL: CandidateRecord = {
  pipelineSteps: [
    step(1, 'Open to process with GHN'),
    step(2, 'Contact'),
    step(3, 'CV fit and continue to process'),
    step(4, 'Sent'),
    step(5, 'Qualified'),
    step(6, 'Cancel'),
  ],
};

const C7_IV2_FAIL: CandidateRecord = {
  pipelineSteps: [
    step(1, 'Open to process with GHN'),
    step(2, 'Contact'),
    step(3, 'CV fit and continue to process'),
    step(4, 'Sent'),
    step(5, 'Qualified'),
    step(6, 'Pass'),
    step(7, 'Fail'),
  ],
};

const C8_OFFER_REJECTED: CandidateRecord = {
  pipelineSteps: [
    step(1, 'Open to process with GHN'),
    step(2, 'Contact'),
    step(3, 'CV fit and continue to process'),
    step(4, 'Sent'),
    step(5, 'Qualified'),
    step(6, 'Pass'),
    step(7, 'Pass'),
    step(8, 'Pass'),
    step(9, 'Candidate reject offer'),
  ],
};

const C9_ONBOARDED: CandidateRecord = {
  pipelineSteps: [
    step(1, 'Open to process with GHN'),
    step(2, 'Contact'),
    step(3, 'CV fit and continue to process'),
    step(4, 'Sent'),
    step(5, 'Qualified'),
    step(6, 'Pass'),
    step(7, 'Pass'),
    step(8, 'Pass'),
    step(9, 'Candidate accept offer'),
    step(10, 'Onboarded'),
  ],
};

const C10_BCKD: CandidateRecord = {
  pipelineSteps: [
    step(1, 'Open to process with GHN'),
    step(2, 'Contact'),
    step(3, 'CV fit and continue to process'),
    step(4, 'Sent'),
    step(5, 'Qualified'),
    step(6, 'Pass'),
    step(7, 'Pass'),
    step(8, 'Pass'),
    step(9, 'Candidate accept offer'),
    step(10, 'Onboarded (BCKD) - Drop ≤7D'),
  ],
};

const ALL_CANDIDATES: CandidateRecord[] = [
  C1_PENDING,
  C2_STEP1,
  C3_STEP3,
  C4_IV1_FAIL,
  C5_IV1_SAVED,
  C6_IV1_CANCEL,
  C7_IV2_FAIL,
  C8_OFFER_REJECTED,
  C9_ONBOARDED,
  C10_BCKD,
];

// ─── Tests ────────────────────────────────────────────────────────────────

describe('isValidStepNumber', () => {
  it('accepts all valid step numbers 1–10', () => {
    for (let n = 1; n <= 10; n++) {
      expect(isValidStepNumber(n)).toBe(true);
    }
  });

  it('rejects 0, negatives, 11, and non-integers', () => {
    expect(isValidStepNumber(0)).toBe(false);
    expect(isValidStepNumber(-1)).toBe(false);
    expect(isValidStepNumber(11)).toBe(false);
    expect(isValidStepNumber(1.5)).toBe(false);
  });
});

describe('computeFunnelReport', () => {
  describe('zero candidates', () => {
    it('returns 0 for totalCandidates and overallConvRate', () => {
      const report = computeFunnelReport([]);
      expect(report.totalCandidates).toBe(0);
      expect(report.overallConvRate).toBe(0);
    });

    it('returns null for all rates when no candidates exist', () => {
      const report = computeFunnelReport([]);
      expect(report.offerAcceptanceRate).toBeNull();
      expect(report.onboardSuccessRate).toBeNull();
      expect(report.interviewPassRates.interview1).toBeNull();
      expect(report.interviewPassRates.interview2).toBeNull();
      expect(report.interviewPassRates.interview3).toBeNull();
    });

    it('returns a 10-entry all-zero stageBreakdown', () => {
      const report = computeFunnelReport([]);
      expect(report.stageBreakdown).toHaveLength(10);
      expect(report.stageBreakdown.every((s) => s.count === 0)).toBe(true);
    });
  });

  describe('stageBreakdown — snapshot semantics', () => {
    it('counts each candidate in exactly one stage — their latest completed step', () => {
      const report = computeFunnelReport(ALL_CANDIDATES);
      const counts = report.stageBreakdown.map((s) => s.count);
      // step:  1  2  3  4  5  6  7  8  9 10
      expect(counts).toEqual([1, 0, 1, 0, 0, 3, 1, 0, 1, 2]);
    });

    it('assigns the correct 1-based stepNumber to each entry', () => {
      const report = computeFunnelReport(ALL_CANDIDATES);
      report.stageBreakdown.forEach((entry, idx) => {
        expect(entry.stepNumber).toBe(idx + 1);
      });
    });

    it('always produces exactly 10 entries', () => {
      expect(computeFunnelReport(ALL_CANDIDATES).stageBreakdown).toHaveLength(10);
      expect(computeFunnelReport([]).stageBreakdown).toHaveLength(10);
    });
  });

  describe('pendingCount', () => {
    it('counts candidates with no completed steps as pending', () => {
      const report = computeFunnelReport(ALL_CANDIDATES);
      expect(report.pendingCount).toBe(1);
    });

    it('pendingCount + sum of stage counts always equals totalCandidates', () => {
      const report = computeFunnelReport(ALL_CANDIDATES);
      const stageSum = report.stageBreakdown.reduce((sum, s) => sum + s.count, 0);
      expect(report.pendingCount + stageSum).toBe(report.totalCandidates);
    });
  });

  describe('conversionRates — historical semantics', () => {
    it('produces 9 entries covering consecutive stage pairs 1→2 through 9→10', () => {
      const report = computeFunnelReport(ALL_CANDIDATES);
      expect(report.conversionRates).toHaveLength(9);
      report.conversionRates.forEach((cr, idx) => {
        expect(cr.fromStep).toBe(idx + 1);
        expect(cr.toStep).toBe(idx + 2);
      });
    });

    it('pair 1→2: 8 of 9 candidates with a step-1 result also have step-2', () => {
      const report = computeFunnelReport(ALL_CANDIDATES);
      const pair = report.conversionRates.find((c) => c.fromStep === 1 && c.toStep === 2)!;
      expect(pair.rate).toBeCloseTo(8 / 9);
    });

    it('pair 6→7: 4 of 7 candidates with a step-6 result also have step-7 (Saved/Cancel are counted in denominator)', () => {
      const report = computeFunnelReport(ALL_CANDIDATES);
      const pair = report.conversionRates.find((c) => c.fromStep === 6 && c.toStep === 7)!;
      expect(pair.rate).toBeCloseTo(4 / 7);
    });

    it('pair 9→10: 2 of 3 candidates with a step-9 result also have step-10', () => {
      const report = computeFunnelReport(ALL_CANDIDATES);
      const pair = report.conversionRates.find((c) => c.fromStep === 9 && c.toStep === 10)!;
      expect(pair.rate).toBeCloseTo(2 / 3);
    });

    it('rate is null (not 0) when no candidates have reached the source stage', () => {
      const report = computeFunnelReport([C2_STEP1]);
      const pair = report.conversionRates.find((c) => c.fromStep === 2 && c.toStep === 3)!;
      expect(pair.rate).toBeNull();
    });
  });

  describe('interviewPassRates — Pass and Fail only (Critical Rule 1)', () => {
    it('interview1: 4 Pass + 1 Fail → rate 4/5; Saved and Cancel excluded from denominator', () => {
      const report = computeFunnelReport(ALL_CANDIDATES);
      expect(report.interviewPassRates.interview1).toBeCloseTo(4 / 5);
    });

    it('interview2: 3 Pass + 1 Fail → rate 3/4', () => {
      const report = computeFunnelReport(ALL_CANDIDATES);
      expect(report.interviewPassRates.interview2).toBeCloseTo(3 / 4);
    });

    it('interview3: 3 Pass + 0 Fail → rate 1.0', () => {
      const report = computeFunnelReport(ALL_CANDIDATES);
      expect(report.interviewPassRates.interview3).toBe(1);
    });

    it('Saved alone at interview1 → null, not 0 (inconclusive, not a concluded result)', () => {
      const report = computeFunnelReport([C5_IV1_SAVED]);
      expect(report.interviewPassRates.interview1).toBeNull();
    });

    it('Cancel alone at interview1 → null, not 0', () => {
      const report = computeFunnelReport([C6_IV1_CANCEL]);
      expect(report.interviewPassRates.interview1).toBeNull();
    });

    it('Waiting alone at interview1 → null, not 0', () => {
      const waiting: CandidateRecord = {
        pipelineSteps: [
          step(1, 'Open to process with GHN'),
          step(2, 'Contact'),
          step(3, 'CV fit and continue to process'),
          step(4, 'Sent'),
          step(5, 'Qualified'),
          step(6, 'Waiting'),
        ],
      };
      const report = computeFunnelReport([waiting]);
      expect(report.interviewPassRates.interview1).toBeNull();
    });
  });

  describe('offerAcceptanceRate', () => {
    it('2 accepted + 1 rejected → rate 2/3', () => {
      const report = computeFunnelReport(ALL_CANDIDATES);
      expect(report.offerAcceptanceRate).toBeCloseTo(2 / 3);
    });

    it('Waiting offer results excluded — rate is null when only pending offers exist', () => {
      const waitingOffer: CandidateRecord = {
        pipelineSteps: [
          step(1, 'Open to process with GHN'),
          step(2, 'Contact'),
          step(3, 'CV fit and continue to process'),
          step(4, 'Sent'),
          step(5, 'Qualified'),
          step(6, 'Pass'),
          step(7, 'Pass'),
          step(8, 'Pass'),
          step(9, 'Waiting candidate feedback'),
        ],
      };
      const report = computeFunnelReport([waitingOffer]);
      expect(report.offerAcceptanceRate).toBeNull();
    });
  });

  describe('onboardSuccessRate — BCKD is a failed hire (Critical Rule 3)', () => {
    it('1 Onboarded + 1 BCKD → success rate 0.5 (BCKD does not count as success)', () => {
      const report = computeFunnelReport(ALL_CANDIDATES);
      expect(report.onboardSuccessRate).toBe(0.5);
    });

    it('BCKD alone at step 10 → rate is 0 (not null): denominator > 0, numerator = 0', () => {
      const report = computeFunnelReport([C10_BCKD]);
      expect(report.onboardSuccessRate).toBe(0);
    });

    it('rate is null when no candidates have reached step 10', () => {
      const report = computeFunnelReport([C1_PENDING, C2_STEP1, C3_STEP3]);
      expect(report.onboardSuccessRate).toBeNull();
    });
  });

  describe('overallConvRate', () => {
    it('1 successfully onboarded of 10 total → 0.1', () => {
      const report = computeFunnelReport(ALL_CANDIDATES);
      expect(report.overallConvRate).toBeCloseTo(0.1);
    });

    it('is 0 (not null) when the candidate list is empty', () => {
      const report = computeFunnelReport([]);
      expect(report.overallConvRate).toBe(0);
    });

    it('BCKD does not count toward overall conversion', () => {
      const report = computeFunnelReport([C10_BCKD]);
      expect(report.overallConvRate).toBe(0);
    });
  });
});
