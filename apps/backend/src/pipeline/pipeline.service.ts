import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MatchCandidateDto } from './dto/match-candidate.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { MoveStageDto } from './dto/move-stage.dto';
import { UpdateOverallStatusDto } from './dto/update-overall-status.dto';
import {
  PIPELINE_STAGES,
  STAGE_RESULT_OPTIONS,
  getResultConfig,
  computeDerivedFields,
} from './pipeline.config';

export { PIPELINE_STAGES, STAGE_RESULT_OPTIONS };

const CANDIDATE_REQUEST_SELECT = {
  id: true,
  candidateId: true,
  requestId: true,
  currentStep: true,
  overallStatus: true,
  isActive: true,
  matchedBy: true,
  matchedAt: true,
  candidate: {
    select: {
      id: true,
      fullName: true,
      email: true,
      // pic = HRBP in charge of this candidate (not the person who performed the match)
      pic: { select: { id: true, fullName: true } },
    },
  },
  request: {
    select: {
      id: true,
      requestNo: true,
      status: true,
      department: { select: { name: true } },
      jobTitle: { select: { title: true } },
    },
  },
  pipelineSteps: { orderBy: { stepNumber: 'asc' as const } },
} as const;

@Injectable()
export class PipelineService {
  constructor(private prisma: PrismaService) {}

  // ============================================================
  // MATCH — create CandidateRequest + 10 PipelineStep records
  // If an inactive record exists (previously unmatched), reactivate
  // it with a fresh pipeline start instead of creating a duplicate.
  // ============================================================
  async match(dto: MatchCandidateDto, userId: string) {
    const [candidate, request] = await Promise.all([
      this.prisma.candidate.findFirst({
        where: { id: dto.candidateId, isArchived: false },
      }),
      this.prisma.request.findUnique({ where: { id: dto.requestId } }),
    ]);

    if (!candidate) throw new NotFoundException('Ứng viên không tồn tại');
    if (!request) throw new NotFoundException('Yêu cầu tuyển dụng không tồn tại');

    const inactive = await this.prisma.candidateRequest.findFirst({
      where: { candidateId: dto.candidateId, requestId: dto.requestId, isActive: false },
    });

    if (inactive) {
      return this.prisma.$transaction(async (tx) => {
        await tx.pipelineStep.updateMany({
          where: { candidateRequestId: inactive.id },
          data: { stepResult: null, stepDate: null, stepNote: null, updatedBy: null },
        });

        const reactivated = await tx.candidateRequest.update({
          where: { id: inactive.id },
          data: {
            isActive: true,
            currentStep: 1,
            overallStatus: 'In Progress',
            matchedBy: userId,
            matchedAt: new Date(),
          },
          select: CANDIDATE_REQUEST_SELECT,
        });

        await this.logActivity(
          dto.candidateId,
          userId,
          'REACTIVATE',
          { overallStatus: 'Closed', isActive: false },
          { requestNo: request.requestNo, overallStatus: 'In Progress', isActive: true, note: dto.note },
          tx,
        );

        return { ...reactivated, ...computeDerivedFields(reactivated.pipelineSteps) };
      });
    }

    try {
      const candidateRequest = await this.prisma.$transaction(async (tx) => {
        const cr = await tx.candidateRequest.create({
          data: {
            candidateId: dto.candidateId,
            requestId: dto.requestId,
            matchedBy: userId,
            overallStatus: 'In Progress',
            currentStep: 1,
          },
        });

        await tx.pipelineStep.createMany({
          data: PIPELINE_STAGES.map((name, idx) => ({
            candidateRequestId: cr.id,
            stepNumber: idx + 1,
            stepName: name,
            stepNote: idx === 0 && dto.note ? dto.note : undefined,
          })),
        });

        await this.logActivity(
          dto.candidateId,
          userId,
          'MATCH',
          null,
          { requestNo: request.requestNo, note: dto.note },
          tx,
        );

        const full = await tx.candidateRequest.findUnique({
          where: { id: cr.id },
          select: CANDIDATE_REQUEST_SELECT,
        });
        return full;
      });

      return { ...candidateRequest, ...computeDerivedFields(candidateRequest!.pipelineSteps) };
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Ứng viên đã được match vào yêu cầu này');
      }
      throw e;
    }
  }

  // ============================================================
  // UNMATCH — soft delete (isActive=false)
  // ============================================================
  async unmatch(candidateRequestId: string, userId: string) {
    const cr = await this.findCandidateRequest(candidateRequestId);

    await this.prisma.candidateRequest.update({
      where: { id: candidateRequestId },
      data: { isActive: false, overallStatus: 'Closed' },
    });

    await this.logActivity(
      cr.candidateId,
      userId,
      'UNMATCH',
      { overallStatus: cr.overallStatus },
      { overallStatus: 'Closed', isActive: false },
    );

    return { message: 'Đã xóa ứng viên khỏi yêu cầu' };
  }

  // ============================================================
  // GET CANDIDATES FOR A REQUEST
  // ============================================================
  async getCandidatesForRequest(requestId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Yêu cầu tuyển dụng không tồn tại');

    const rows = await this.prisma.candidateRequest.findMany({
      where: { requestId, isActive: true },
      select: CANDIDATE_REQUEST_SELECT,
      orderBy: { matchedAt: 'desc' },
    });

    return rows.map((r) => ({ ...r, ...computeDerivedFields(r.pipelineSteps) }));
  }

  // ============================================================
  // UPDATE STEP — result/date/note with result-type state machine
  // ============================================================
  async updateStep(
    candidateRequestId: string,
    stepNumber: number,
    dto: UpdateStepDto,
    userId: string,
  ) {
    const cr = await this.findCandidateRequest(candidateRequestId);

    const step = cr.pipelineSteps.find((s) => s.stepNumber === stepNumber);
    if (!step) throw new NotFoundException(`Bước ${stepNumber} không tồn tại`);

    if (dto.stepResult !== undefined) {
      const stageName = PIPELINE_STAGES[stepNumber - 1];
      const allowed = STAGE_RESULT_OPTIONS[stageName] ?? [];
      if (!allowed.includes(dto.stepResult)) {
        throw new BadRequestException(
          `Kết quả "${dto.stepResult}" không hợp lệ cho bước "${stageName}". Cho phép: ${allowed.join(', ')}`,
        );
      }
    }

    // Business rule: when saving a result, always record when it was updated.
    // - If HRBP provides an explicit date (e.g. backfilling), use that.
    // - If no date given but a result is being saved, auto-set to now.
    // - If only stepNote is changing (no result), do not touch stepDate.
    const stepDateValue: Date | undefined =
      dto.stepDate !== undefined
        ? new Date(dto.stepDate)
        : dto.stepResult !== undefined
          ? new Date()
          : undefined;

    const updatedStep = await this.prisma.pipelineStep.update({
      where: { id: step.id },
      data: {
        ...(dto.stepResult !== undefined && { stepResult: dto.stepResult }),
        ...(stepDateValue !== undefined && { stepDate: stepDateValue }),
        ...(dto.stepNote !== undefined && { stepNote: dto.stepNote }),
        updatedBy: userId,
      },
    });

    let newCurrentStep = cr.currentStep;

    if (dto.stepResult !== undefined) {
      const stageName = PIPELINE_STAGES[stepNumber - 1];
      const config = getResultConfig(stageName, dto.stepResult);
      if (config) {
        if (config.type === 'continue' && config.nextStep) {
          newCurrentStep = config.nextStep;
          await this.prisma.candidateRequest.update({
            where: { id: candidateRequestId },
            data: { currentStep: newCurrentStep, overallStatus: 'In Progress' },
          });
        } else if (config.type === 'terminal') {
          await this.prisma.candidateRequest.update({
            where: { id: candidateRequestId },
            data: { overallStatus: 'Closed' },
          });
        } else if (config.type === 'completed') {
          await this.prisma.candidateRequest.update({
            where: { id: candidateRequestId },
            data: { overallStatus: 'Onboarded' },
          });
          await this.prisma.request.update({
            where: { id: cr.requestId },
            data: { onboardDate: new Date() },
          });
        }
        // 'waiting': no state change
      }
    }

    await this.logActivity(cr.candidateId, userId, 'UPDATE_STEP', null, {
      step: stepNumber,
      stageName: PIPELINE_STAGES[stepNumber - 1],
      result: dto.stepResult,
      date: dto.stepDate,
      note: dto.stepNote,
    });

    // Compute derived fields from in-memory updated steps (no extra DB round-trip)
    const updatedSteps = cr.pipelineSteps.map((s) =>
      s.stepNumber === stepNumber && dto.stepResult !== undefined
        ? { ...s, stepResult: dto.stepResult! }
        : s,
    );

    return {
      ...updatedStep,
      currentStep: newCurrentStep,
      ...computeDerivedFields(updatedSteps),
    };
  }

  // ============================================================
  // MOVE STAGE — validate result-type allows the jump, then advance
  // ============================================================
  async moveStage(
    candidateRequestId: string,
    dto: MoveStageDto,
    userId: string,
  ) {
    const cr = await this.findCandidateRequest(candidateRequestId);

    const derived = computeDerivedFields(cr.pipelineSteps);

    if (!derived.canMoveNext) {
      throw new BadRequestException(
        derived.latestCompletedStepName
          ? `Không thể chuyển bước: kết quả "${derived.latestResult}" tại "${derived.latestCompletedStepName}" không cho phép tiếp tục`
          : 'Không thể chuyển bước: chưa có kết quả nào được cập nhật',
      );
    }

    const latestConfig = getResultConfig(
      derived.latestCompletedStepName!,
      derived.latestResult!,
    )!;

    if (latestConfig.nextStep !== dto.targetStep) {
      const expectedStageName = PIPELINE_STAGES[latestConfig.nextStep! - 1];
      const requestedStageName = PIPELINE_STAGES[dto.targetStep - 1] ?? `bước ${dto.targetStep}`;
      throw new BadRequestException(
        `Không hợp lệ: chuyển từ "${derived.latestCompletedStepName}" sang "${requestedStageName}". Bước tiếp theo đúng: "${expectedStageName}"`,
      );
    }

    const updated = await this.prisma.candidateRequest.update({
      where: { id: candidateRequestId },
      data: { currentStep: dto.targetStep },
      select: CANDIDATE_REQUEST_SELECT,
    });

    await this.logActivity(cr.candidateId, userId, 'MOVE_STAGE', null, {
      from: cr.currentStep,
      to: dto.targetStep,
      stageName: PIPELINE_STAGES[dto.targetStep - 1],
      note: dto.note,
    });

    return { ...updated, ...computeDerivedFields(updated.pipelineSteps) };
  }

  // ============================================================
  // UPDATE OVERALL STATUS
  // ============================================================
  async updateOverallStatus(
    candidateRequestId: string,
    dto: UpdateOverallStatusDto,
    userId: string,
  ) {
    const cr = await this.findCandidateRequest(candidateRequestId);

    const updated = await this.prisma.candidateRequest.update({
      where: { id: candidateRequestId },
      data: { overallStatus: dto.overallStatus },
      select: CANDIDATE_REQUEST_SELECT,
    });

    await this.logActivity(cr.candidateId, userId, 'UPDATE_STATUS', null, {
      from: cr.overallStatus,
      to: dto.overallStatus,
    });

    return { ...updated, ...computeDerivedFields(updated.pipelineSteps) };
  }

  // ============================================================
  // GET ONE CANDIDATE REQUEST
  // ============================================================
  async findOne(candidateRequestId: string) {
    const cr = await this.findCandidateRequest(candidateRequestId);
    return { ...cr, ...computeDerivedFields(cr.pipelineSteps) };
  }

  // ============================================================
  // HELPERS
  // ============================================================
  private async findCandidateRequest(id: string) {
    const cr = await this.prisma.candidateRequest.findUnique({
      where: { id },
      include: {
        pipelineSteps: { orderBy: { stepNumber: 'asc' } },
      },
    });
    if (!cr) throw new NotFoundException('CandidateRequest không tồn tại');
    return cr;
  }

  private async logActivity(
    entityId: string,
    userId: string,
    action: string,
    before: any,
    after: any,
    tx?: any,
  ) {
    const client = tx ?? this.prisma;
    await client.activityLog.create({
      data: {
        entityType: 'Candidate',
        entityId,
        userId,
        action,
        changesJson: { before, after },
      },
    });
  }
}
