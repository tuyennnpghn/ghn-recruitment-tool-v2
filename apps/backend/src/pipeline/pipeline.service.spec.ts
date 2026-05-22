import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { PrismaService } from '../prisma/prisma.service';
import { getResultConfig, computeDerivedFields, PIPELINE_STAGES } from './pipeline.config';

// ─── Pure-function tests (no DB) ─────────────────────────────────────────────

describe('getResultConfig', () => {
  it('returns continue config for "Open to process with GHN"', () => {
    const cfg = getResultConfig('Successfully Approached', 'Open to process with GHN');
    expect(cfg).toEqual({ type: 'continue', nextStep: 2 });
  });

  it('returns terminal config for "Not fit" at HR Screening', () => {
    const cfg = getResultConfig('HR Screening', 'Not fit');
    expect(cfg).toEqual({ type: 'terminal' });
  });

  it('returns waiting config for "Waiting" at Interview 1', () => {
    const cfg = getResultConfig('Interview 1', 'Waiting');
    expect(cfg).toEqual({ type: 'waiting' });
  });

  it('returns terminal config for "Candidate reject offer"', () => {
    const cfg = getResultConfig('Offer to Candidate', 'Candidate reject offer');
    expect(cfg).toEqual({ type: 'terminal' });
  });

  it('returns completed config for "Onboarded" at Onboard Status', () => {
    const cfg = getResultConfig('Onboard Status', 'Onboarded');
    expect(cfg).toEqual({ type: 'completed' });
  });

  it('returns null for an unknown result', () => {
    expect(getResultConfig('HR Screening', 'Unknown result')).toBeNull();
  });

  it('returns null for an unknown stage', () => {
    expect(getResultConfig('Fake Stage', 'Pass')).toBeNull();
  });
});

describe('computeDerivedFields', () => {
  const makeSteps = (overrides: Partial<{ stepNumber: number; stepResult: string | null }>[]) =>
    PIPELINE_STAGES.map((name, idx) => ({
      stepNumber: idx + 1,
      stepName: name,
      stepResult: null as string | null,
      ...overrides.find((o) => o.stepNumber === idx + 1),
    }));

  // Case 1: Successfully Approached → "Open to process with GHN" → canMoveNext=true, nextStep=Submitted CV
  it('Case 1 — continue: canMoveNext=true, nextStepName=Submitted CV', () => {
    const steps = makeSteps([{ stepNumber: 1, stepResult: 'Open to process with GHN' }]);
    const derived = computeDerivedFields(steps);
    expect(derived.canMoveNext).toBe(true);
    expect(derived.nextStepName).toBe('Submitted CV');
    expect(derived.latestCompletedStep).toBe(1);
    expect(derived.latestCompletedStepName).toBe('Successfully Approached');
    expect(derived.latestResult).toBe('Open to process with GHN');
    expect(derived.statusType).toBe('continue');
  });

  // Case 2: HR Screening → "Not fit" → canMoveNext=false, nextStepName=Closed
  it('Case 2 — terminal: canMoveNext=false, nextStepName=Closed', () => {
    const steps = makeSteps([
      { stepNumber: 1, stepResult: 'Open to process with GHN' },
      { stepNumber: 2, stepResult: 'Contact' },
      { stepNumber: 3, stepResult: 'Not fit' },
    ]);
    const derived = computeDerivedFields(steps);
    expect(derived.canMoveNext).toBe(false);
    expect(derived.nextStepName).toBe('Closed');
    expect(derived.latestCompletedStep).toBe(3);
    expect(derived.statusType).toBe('terminal');
  });

  // Case 3: Interview 1 → "Waiting" → canMoveNext=false, nextStepName=Waiting
  it('Case 3 — waiting: canMoveNext=false, nextStepName=Waiting', () => {
    const steps = makeSteps([{ stepNumber: 6, stepResult: 'Waiting' }]);
    const derived = computeDerivedFields(steps);
    expect(derived.canMoveNext).toBe(false);
    expect(derived.nextStepName).toBe('Waiting');
    expect(derived.statusType).toBe('waiting');
  });

  // Case 5: Onboard Status → "Onboarded" → canMoveNext=false, nextStepName=Completed
  it('Case 5 — completed: canMoveNext=false, nextStepName=Completed', () => {
    const steps = makeSteps([{ stepNumber: 10, stepResult: 'Onboarded' }]);
    const derived = computeDerivedFields(steps);
    expect(derived.canMoveNext).toBe(false);
    expect(derived.nextStepName).toBe('Completed');
    expect(derived.statusType).toBe('completed');
  });

  it('returns all nulls/false when no steps have results', () => {
    const steps = makeSteps([]);
    const derived = computeDerivedFields(steps);
    expect(derived.canMoveNext).toBe(false);
    expect(derived.latestCompletedStep).toBeNull();
    expect(derived.statusType).toBeNull();
  });
});

// ─── Shared helpers for service tests ────────────────────────────────────────

const makeStep = (idx: number, resultOverride?: string | null) => ({
  id: `step-${idx + 1}`,
  stepNumber: idx + 1,
  stepName: PIPELINE_STAGES[idx],
  stepResult: resultOverride !== undefined ? resultOverride : (null as string | null),
  stepDate: null,
  stepNote: null,
  updatedBy: null,
  candidateRequestId: 'cr-1',
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeCr = (
  stepsOverride: Partial<{ stepNumber: number; stepResult: string | null }>[],
  currentStep = 1,
  overallStatus = 'In Progress',
) => {
  const steps = PIPELINE_STAGES.map((_, idx) => {
    const ov = stepsOverride.find((o) => o.stepNumber === idx + 1);
    return makeStep(idx, ov?.stepResult);
  });
  return {
    id: 'cr-1',
    candidateId: 'cand-1',
    requestId: 'req-1',
    currentStep,
    overallStatus,
    isActive: true,
    matchedBy: 'user-1',
    matchedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    pipelineSteps: steps,
  };
};

// ─── Service integration test — updateStep() (Cases 1–3, 5) ──────────────────

describe('PipelineService.updateStep()', () => {
  let service: PipelineService;
  let prisma: any;

  beforeEach(async () => {
    const prismaMock = {
      candidateRequest: { findUnique: jest.fn(), update: jest.fn() },
      pipelineStep: { update: jest.fn() },
      request: { update: jest.fn() },
      activityLog: { create: jest.fn() },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [PipelineService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = module.get<PipelineService>(PipelineService);
    prisma = module.get(PrismaService);
  });

  const stubStep = (stepNumber: number, result?: string) => ({
    id: `step-${stepNumber}`,
    stepNumber,
    stepName: PIPELINE_STAGES[stepNumber - 1],
    stepResult: result ?? null,
    stepDate: null,
    stepNote: null,
    updatedBy: null,
    candidateRequestId: 'cr-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Case 2: HR Screening = "Not fit"
  it('Case 2 — terminal: saves stepResult AND sets overallStatus=Closed, currentStep unchanged', async () => {
    const cr = makeCr([], 3, 'In Progress'); // currentStep=3 (HR Screening)
    (prisma.candidateRequest.findUnique as jest.Mock).mockResolvedValue(cr);
    (prisma.pipelineStep.update as jest.Mock).mockResolvedValue(stubStep(3, 'Not fit'));
    (prisma.candidateRequest.update as jest.Mock).mockResolvedValue({});
    (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

    const result = await service.updateStep('cr-1', 3, { stepResult: 'Not fit' }, 'user-1');

    // Step record must be saved
    expect(prisma.pipelineStep.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ stepResult: 'Not fit' }) }),
    );
    // candidateRequest must get overallStatus=Closed (no currentStep change)
    expect(prisma.candidateRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { overallStatus: 'Closed' } }),
    );
    // currentStep unchanged = 3
    expect(result.currentStep).toBe(3);
    // Derived fields
    expect(result.canMoveNext).toBe(false);
    expect(result.nextStepName).toBe('Closed');
    // request.update must NOT have been called
    expect(prisma.request.update).not.toHaveBeenCalled();
  });

  // Case 3: Interview 1 = "Waiting"
  it('Case 3 — waiting: saves stepResult AND leaves candidateRequest untouched', async () => {
    const cr = makeCr([], 6, 'In Progress'); // currentStep=6 (Interview 1)
    (prisma.candidateRequest.findUnique as jest.Mock).mockResolvedValue(cr);
    (prisma.pipelineStep.update as jest.Mock).mockResolvedValue(stubStep(6, 'Waiting'));
    (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

    const result = await service.updateStep('cr-1', 6, { stepResult: 'Waiting' }, 'user-1');

    // Step record must be saved with 'Waiting'
    expect(prisma.pipelineStep.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ stepResult: 'Waiting' }) }),
    );
    // candidateRequest.update must NOT be called at all
    expect(prisma.candidateRequest.update).not.toHaveBeenCalled();
    // request.update must NOT be called
    expect(prisma.request.update).not.toHaveBeenCalled();
    // currentStep stays at 6
    expect(result.currentStep).toBe(6);
    expect(result.canMoveNext).toBe(false);
    expect(result.nextStepName).toBe('Waiting');
  });

  // Case 1 (via updateStep): Interview 1 = "Pass"
  it('Case 1b — continue: saves stepResult AND advances currentStep=7, canMoveNext=true', async () => {
    const cr = makeCr([], 6, 'In Progress');
    (prisma.candidateRequest.findUnique as jest.Mock).mockResolvedValue(cr);
    (prisma.pipelineStep.update as jest.Mock).mockResolvedValue(stubStep(6, 'Pass'));
    (prisma.candidateRequest.update as jest.Mock).mockResolvedValue({});
    (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

    const result = await service.updateStep('cr-1', 6, { stepResult: 'Pass' }, 'user-1');

    expect(prisma.pipelineStep.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ stepResult: 'Pass' }) }),
    );
    expect(prisma.candidateRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { currentStep: 7, overallStatus: 'In Progress' } }),
    );
    expect(result.currentStep).toBe(7);
    expect(result.canMoveNext).toBe(true);
    expect(result.nextStepName).toBe('Interview 2');
  });

  // stepDate auto-set: when stepResult is saved without an explicit date, backend records now
  it('auto-sets stepDate to now when stepResult is saved and dto.stepDate is not provided', async () => {
    const cr = makeCr([], 3, 'In Progress');
    (prisma.candidateRequest.findUnique as jest.Mock).mockResolvedValue(cr);
    (prisma.pipelineStep.update as jest.Mock).mockResolvedValue(stubStep(3, 'Not fit'));
    (prisma.candidateRequest.update as jest.Mock).mockResolvedValue({});
    (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

    await service.updateStep('cr-1', 3, { stepResult: 'Not fit' }, 'user-1');

    expect(prisma.pipelineStep.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stepDate: expect.any(Date) }),
      }),
    );
  });

  // stepDate preserved: when HRBP provides an explicit date (e.g. backfilling), use it as-is
  it('preserves provided stepDate when dto.stepDate is explicitly given', async () => {
    const cr = makeCr([], 3, 'In Progress');
    (prisma.candidateRequest.findUnique as jest.Mock).mockResolvedValue(cr);
    (prisma.pipelineStep.update as jest.Mock).mockResolvedValue(stubStep(3, 'Not fit'));
    (prisma.candidateRequest.update as jest.Mock).mockResolvedValue({});
    (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

    const explicitDate = '2026-01-15';
    await service.updateStep('cr-1', 3, { stepResult: 'Not fit', stepDate: explicitDate }, 'user-1');

    expect(prisma.pipelineStep.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stepDate: new Date(explicitDate) }),
      }),
    );
  });

  // stepDate not touched: note-only updates must not overwrite the existing stepDate
  it('does not write stepDate when only stepNote is updated (no stepResult)', async () => {
    const cr = makeCr([], 3, 'In Progress');
    (prisma.candidateRequest.findUnique as jest.Mock).mockResolvedValue(cr);
    (prisma.pipelineStep.update as jest.Mock).mockResolvedValue(stubStep(3));
    (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

    await service.updateStep('cr-1', 3, { stepNote: 'Just a note' }, 'user-1');

    const callData = (prisma.pipelineStep.update as jest.Mock).mock.calls[0][0].data;
    expect(callData).not.toHaveProperty('stepDate');
  });

  // Case 5: Onboard Status = "Onboarded"
  it('Case 5 — completed: saves stepResult, sets overallStatus=Onboarded, updates request.onboardDate', async () => {
    const cr = makeCr([], 10, 'In Progress');
    (prisma.candidateRequest.findUnique as jest.Mock).mockResolvedValue(cr);
    (prisma.pipelineStep.update as jest.Mock).mockResolvedValue(stubStep(10, 'Onboarded'));
    (prisma.candidateRequest.update as jest.Mock).mockResolvedValue({});
    (prisma.request.update as jest.Mock).mockResolvedValue({});
    (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

    const result = await service.updateStep('cr-1', 10, { stepResult: 'Onboarded' }, 'user-1');

    expect(prisma.pipelineStep.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ stepResult: 'Onboarded' }) }),
    );
    expect(prisma.candidateRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { overallStatus: 'Onboarded' } }),
    );
    expect(prisma.request.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ onboardDate: expect.any(Date) }) }),
    );
    expect(result.canMoveNext).toBe(false);
    expect(result.nextStepName).toBe('Completed');
  });
});

// ─── Service integration test — moveStage() guard (Case 4 & 6) ───────────────

describe('PipelineService.moveStage()', () => {
  let service: PipelineService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const prismaMock = {
      candidateRequest: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      activityLog: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
    prisma = module.get(PrismaService);
  });

  // Case 4: Offer to Candidate → "Candidate reject offer" → overallStatus should be Closed
  // (Tested via computeDerivedFields above; here we verify moveStage rejects a jump after terminal)
  it('Case 4 — rejects moveStage after terminal result', async () => {
    const cr = makeCr([
      { stepNumber: 1, stepResult: 'Open to process with GHN' },
      { stepNumber: 2, stepResult: 'Contact' },
      { stepNumber: 3, stepResult: 'CV fit and continue to process' },
      { stepNumber: 4, stepResult: 'Sent' },
      { stepNumber: 5, stepResult: 'Qualified' },
      { stepNumber: 6, stepResult: 'Pass' },
      { stepNumber: 7, stepResult: 'Pass' },
      { stepNumber: 8, stepResult: 'Pass' },
      { stepNumber: 9, stepResult: 'Candidate reject offer' }, // terminal — actually step 9 is Interview 3
    ]);
    // Put terminal at offer stage (step 9 = Offer to Candidate)
    cr.pipelineSteps[8].stepResult = 'Candidate reject offer';
    (prisma.candidateRequest.findUnique as jest.Mock).mockResolvedValue(cr);

    await expect(
      service.moveStage('cr-1', { targetStep: 10, note: '' }, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  // Case 6: Interview 1 → Interview 3 → validation error (skips step 2)
  it('Case 6 — rejects invalid stage jump (Interview 1 Pass → Interview 3)', async () => {
    const cr = makeCr([{ stepNumber: 6, stepResult: 'Pass' }]);
    (prisma.candidateRequest.findUnique as jest.Mock).mockResolvedValue(cr);

    // Interview 1 Pass → nextStep=7 (Interview 2), but we try targetStep=8 (Interview 3)
    await expect(
      service.moveStage('cr-1', { targetStep: 8, note: '' }, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('accepts a valid stage move (Interview 1 Pass → Interview 2)', async () => {
    const cr = makeCr([{ stepNumber: 6, stepResult: 'Pass' }]);
    (prisma.candidateRequest.findUnique as jest.Mock).mockResolvedValue(cr);
    (prisma.candidateRequest.update as jest.Mock).mockResolvedValue({
      ...cr,
      currentStep: 7,
    });
    (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

    await expect(
      service.moveStage('cr-1', { targetStep: 7, note: '' }, 'user-1'),
    ).resolves.toBeDefined();
  });
});
