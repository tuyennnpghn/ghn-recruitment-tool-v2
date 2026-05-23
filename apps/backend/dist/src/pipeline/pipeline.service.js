"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineService = exports.STAGE_RESULT_OPTIONS = exports.PIPELINE_STAGES = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pipeline_config_1 = require("./pipeline.config");
Object.defineProperty(exports, "PIPELINE_STAGES", { enumerable: true, get: function () { return pipeline_config_1.PIPELINE_STAGES; } });
Object.defineProperty(exports, "STAGE_RESULT_OPTIONS", { enumerable: true, get: function () { return pipeline_config_1.STAGE_RESULT_OPTIONS; } });
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
    pipelineSteps: { orderBy: { stepNumber: 'asc' } },
};
let PipelineService = class PipelineService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async match(dto, userId) {
        const [candidate, request] = await Promise.all([
            this.prisma.candidate.findFirst({
                where: { id: dto.candidateId, isArchived: false },
            }),
            this.prisma.request.findUnique({ where: { id: dto.requestId } }),
        ]);
        if (!candidate)
            throw new common_1.NotFoundException('Ứng viên không tồn tại');
        if (!request)
            throw new common_1.NotFoundException('Yêu cầu tuyển dụng không tồn tại');
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
                await this.logActivity(dto.candidateId, userId, 'REACTIVATE', { overallStatus: 'Closed', isActive: false }, { requestNo: request.requestNo, overallStatus: 'In Progress', isActive: true, note: dto.note }, tx);
                return { ...reactivated, ...(0, pipeline_config_1.computeDerivedFields)(reactivated.pipelineSteps) };
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
                    data: pipeline_config_1.PIPELINE_STAGES.map((name, idx) => ({
                        candidateRequestId: cr.id,
                        stepNumber: idx + 1,
                        stepName: name,
                        stepNote: idx === 0 && dto.note ? dto.note : undefined,
                    })),
                });
                await this.logActivity(dto.candidateId, userId, 'MATCH', null, { requestNo: request.requestNo, note: dto.note }, tx);
                const full = await tx.candidateRequest.findUnique({
                    where: { id: cr.id },
                    select: CANDIDATE_REQUEST_SELECT,
                });
                return full;
            });
            return { ...candidateRequest, ...(0, pipeline_config_1.computeDerivedFields)(candidateRequest.pipelineSteps) };
        }
        catch (e) {
            if (e?.code === 'P2002') {
                throw new common_1.ConflictException('Ứng viên đã được match vào yêu cầu này');
            }
            throw e;
        }
    }
    async unmatch(candidateRequestId, userId) {
        const cr = await this.findCandidateRequest(candidateRequestId);
        await this.prisma.candidateRequest.update({
            where: { id: candidateRequestId },
            data: { isActive: false, overallStatus: 'Closed' },
        });
        await this.logActivity(cr.candidateId, userId, 'UNMATCH', { overallStatus: cr.overallStatus }, { overallStatus: 'Closed', isActive: false });
        return { message: 'Đã xóa ứng viên khỏi yêu cầu' };
    }
    async getCandidatesForRequest(requestId) {
        const request = await this.prisma.request.findUnique({
            where: { id: requestId },
        });
        if (!request)
            throw new common_1.NotFoundException('Yêu cầu tuyển dụng không tồn tại');
        const rows = await this.prisma.candidateRequest.findMany({
            where: { requestId, isActive: true },
            select: CANDIDATE_REQUEST_SELECT,
            orderBy: { matchedAt: 'desc' },
        });
        return rows.map((r) => ({ ...r, ...(0, pipeline_config_1.computeDerivedFields)(r.pipelineSteps) }));
    }
    async updateStep(candidateRequestId, stepNumber, dto, userId) {
        const cr = await this.findCandidateRequest(candidateRequestId);
        const step = cr.pipelineSteps.find((s) => s.stepNumber === stepNumber);
        if (!step)
            throw new common_1.NotFoundException(`Bước ${stepNumber} không tồn tại`);
        if (dto.stepResult !== undefined) {
            const stageName = pipeline_config_1.PIPELINE_STAGES[stepNumber - 1];
            const allowed = pipeline_config_1.STAGE_RESULT_OPTIONS[stageName] ?? [];
            if (!allowed.includes(dto.stepResult)) {
                throw new common_1.BadRequestException(`Kết quả "${dto.stepResult}" không hợp lệ cho bước "${stageName}". Cho phép: ${allowed.join(', ')}`);
            }
        }
        const stepDateValue = dto.stepDate !== undefined
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
            const stageName = pipeline_config_1.PIPELINE_STAGES[stepNumber - 1];
            const config = (0, pipeline_config_1.getResultConfig)(stageName, dto.stepResult);
            if (config) {
                if (config.type === 'continue' && config.nextStep) {
                    newCurrentStep = config.nextStep;
                    await this.prisma.candidateRequest.update({
                        where: { id: candidateRequestId },
                        data: { currentStep: newCurrentStep, overallStatus: 'In Progress' },
                    });
                }
                else if (config.type === 'terminal') {
                    await this.prisma.candidateRequest.update({
                        where: { id: candidateRequestId },
                        data: { overallStatus: 'Closed' },
                    });
                }
                else if (config.type === 'completed') {
                    await this.prisma.candidateRequest.update({
                        where: { id: candidateRequestId },
                        data: { overallStatus: 'Onboarded' },
                    });
                    await this.prisma.request.update({
                        where: { id: cr.requestId },
                        data: { onboardDate: new Date() },
                    });
                }
            }
        }
        await this.logActivity(cr.candidateId, userId, 'UPDATE_STEP', null, {
            step: stepNumber,
            stageName: pipeline_config_1.PIPELINE_STAGES[stepNumber - 1],
            result: dto.stepResult,
            date: dto.stepDate,
            note: dto.stepNote,
        });
        const updatedSteps = cr.pipelineSteps.map((s) => s.stepNumber === stepNumber && dto.stepResult !== undefined
            ? { ...s, stepResult: dto.stepResult }
            : s);
        return {
            ...updatedStep,
            currentStep: newCurrentStep,
            ...(0, pipeline_config_1.computeDerivedFields)(updatedSteps),
        };
    }
    async moveStage(candidateRequestId, dto, userId) {
        const cr = await this.findCandidateRequest(candidateRequestId);
        const derived = (0, pipeline_config_1.computeDerivedFields)(cr.pipelineSteps);
        if (!derived.canMoveNext) {
            throw new common_1.BadRequestException(derived.latestCompletedStepName
                ? `Không thể chuyển bước: kết quả "${derived.latestResult}" tại "${derived.latestCompletedStepName}" không cho phép tiếp tục`
                : 'Không thể chuyển bước: chưa có kết quả nào được cập nhật');
        }
        const latestConfig = (0, pipeline_config_1.getResultConfig)(derived.latestCompletedStepName, derived.latestResult);
        if (latestConfig.nextStep !== dto.targetStep) {
            const expectedStageName = pipeline_config_1.PIPELINE_STAGES[latestConfig.nextStep - 1];
            const requestedStageName = pipeline_config_1.PIPELINE_STAGES[dto.targetStep - 1] ?? `bước ${dto.targetStep}`;
            throw new common_1.BadRequestException(`Không hợp lệ: chuyển từ "${derived.latestCompletedStepName}" sang "${requestedStageName}". Bước tiếp theo đúng: "${expectedStageName}"`);
        }
        const updated = await this.prisma.candidateRequest.update({
            where: { id: candidateRequestId },
            data: { currentStep: dto.targetStep },
            select: CANDIDATE_REQUEST_SELECT,
        });
        await this.logActivity(cr.candidateId, userId, 'MOVE_STAGE', null, {
            from: cr.currentStep,
            to: dto.targetStep,
            stageName: pipeline_config_1.PIPELINE_STAGES[dto.targetStep - 1],
            note: dto.note,
        });
        return { ...updated, ...(0, pipeline_config_1.computeDerivedFields)(updated.pipelineSteps) };
    }
    async updateOverallStatus(candidateRequestId, dto, userId) {
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
        return { ...updated, ...(0, pipeline_config_1.computeDerivedFields)(updated.pipelineSteps) };
    }
    async findOne(candidateRequestId) {
        const cr = await this.findCandidateRequest(candidateRequestId);
        return { ...cr, ...(0, pipeline_config_1.computeDerivedFields)(cr.pipelineSteps) };
    }
    async findCandidateRequest(id) {
        const cr = await this.prisma.candidateRequest.findUnique({
            where: { id },
            include: {
                pipelineSteps: { orderBy: { stepNumber: 'asc' } },
            },
        });
        if (!cr)
            throw new common_1.NotFoundException('CandidateRequest không tồn tại');
        return cr;
    }
    async logActivity(entityId, userId, action, before, after, tx) {
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
};
exports.PipelineService = PipelineService;
exports.PipelineService = PipelineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PipelineService);
//# sourceMappingURL=pipeline.service.js.map