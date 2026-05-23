import { PrismaService } from '../prisma/prisma.service';
import { MatchCandidateDto } from './dto/match-candidate.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { MoveStageDto } from './dto/move-stage.dto';
import { UpdateOverallStatusDto } from './dto/update-overall-status.dto';
import { PIPELINE_STAGES, STAGE_RESULT_OPTIONS } from './pipeline.config';
export { PIPELINE_STAGES, STAGE_RESULT_OPTIONS };
export declare class PipelineService {
    private prisma;
    constructor(prisma: PrismaService);
    match(dto: MatchCandidateDto, userId: string): Promise<{
        latestCompletedStep: number | null;
        latestCompletedStepName: string | null;
        latestResult: string | null;
        nextStepName: string | null;
        canMoveNext: boolean;
        statusType: import("./pipeline.config").ResultType | null;
        id?: string | undefined;
        isActive?: boolean | undefined;
        request?: {
            id: string;
            department: {
                name: string;
            };
            jobTitle: {
                title: string;
            } | null;
            status: string;
            requestNo: string;
        } | undefined;
        candidate?: {
            id: string;
            email: string | null;
            fullName: string;
            pic: {
                id: string;
                fullName: string;
            };
        } | undefined;
        candidateId?: string | undefined;
        requestId?: string | undefined;
        currentStep?: number | undefined;
        overallStatus?: string | null | undefined;
        matchedBy?: string | undefined;
        matchedAt?: Date | undefined;
        pipelineSteps?: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            candidateRequestId: string;
            stepNumber: number;
            stepName: string;
            stepDate: Date | null;
            stepResult: string | null;
            stepNote: string | null;
            updatedBy: string | null;
        }[] | undefined;
    }>;
    unmatch(candidateRequestId: string, userId: string): Promise<{
        message: string;
    }>;
    getCandidatesForRequest(requestId: string): Promise<{
        latestCompletedStep: number | null;
        latestCompletedStepName: string | null;
        latestResult: string | null;
        nextStepName: string | null;
        canMoveNext: boolean;
        statusType: import("./pipeline.config").ResultType | null;
        id: string;
        isActive: boolean;
        request: {
            id: string;
            department: {
                name: string;
            };
            jobTitle: {
                title: string;
            } | null;
            status: string;
            requestNo: string;
        };
        candidate: {
            id: string;
            email: string | null;
            fullName: string;
            pic: {
                id: string;
                fullName: string;
            };
        };
        candidateId: string;
        requestId: string;
        currentStep: number;
        overallStatus: string | null;
        matchedBy: string;
        matchedAt: Date;
        pipelineSteps: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            candidateRequestId: string;
            stepNumber: number;
            stepName: string;
            stepDate: Date | null;
            stepResult: string | null;
            stepNote: string | null;
            updatedBy: string | null;
        }[];
    }[]>;
    updateStep(candidateRequestId: string, stepNumber: number, dto: UpdateStepDto, userId: string): Promise<{
        latestCompletedStep: number | null;
        latestCompletedStepName: string | null;
        latestResult: string | null;
        nextStepName: string | null;
        canMoveNext: boolean;
        statusType: import("./pipeline.config").ResultType | null;
        currentStep: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        candidateRequestId: string;
        stepNumber: number;
        stepName: string;
        stepDate: Date | null;
        stepResult: string | null;
        stepNote: string | null;
        updatedBy: string | null;
    }>;
    moveStage(candidateRequestId: string, dto: MoveStageDto, userId: string): Promise<{
        latestCompletedStep: number | null;
        latestCompletedStepName: string | null;
        latestResult: string | null;
        nextStepName: string | null;
        canMoveNext: boolean;
        statusType: import("./pipeline.config").ResultType | null;
        id: string;
        isActive: boolean;
        request: {
            id: string;
            department: {
                name: string;
            };
            jobTitle: {
                title: string;
            } | null;
            status: string;
            requestNo: string;
        };
        candidate: {
            id: string;
            email: string | null;
            fullName: string;
            pic: {
                id: string;
                fullName: string;
            };
        };
        candidateId: string;
        requestId: string;
        currentStep: number;
        overallStatus: string | null;
        matchedBy: string;
        matchedAt: Date;
        pipelineSteps: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            candidateRequestId: string;
            stepNumber: number;
            stepName: string;
            stepDate: Date | null;
            stepResult: string | null;
            stepNote: string | null;
            updatedBy: string | null;
        }[];
    }>;
    updateOverallStatus(candidateRequestId: string, dto: UpdateOverallStatusDto, userId: string): Promise<{
        latestCompletedStep: number | null;
        latestCompletedStepName: string | null;
        latestResult: string | null;
        nextStepName: string | null;
        canMoveNext: boolean;
        statusType: import("./pipeline.config").ResultType | null;
        id: string;
        isActive: boolean;
        request: {
            id: string;
            department: {
                name: string;
            };
            jobTitle: {
                title: string;
            } | null;
            status: string;
            requestNo: string;
        };
        candidate: {
            id: string;
            email: string | null;
            fullName: string;
            pic: {
                id: string;
                fullName: string;
            };
        };
        candidateId: string;
        requestId: string;
        currentStep: number;
        overallStatus: string | null;
        matchedBy: string;
        matchedAt: Date;
        pipelineSteps: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            candidateRequestId: string;
            stepNumber: number;
            stepName: string;
            stepDate: Date | null;
            stepResult: string | null;
            stepNote: string | null;
            updatedBy: string | null;
        }[];
    }>;
    findOne(candidateRequestId: string): Promise<{
        latestCompletedStep: number | null;
        latestCompletedStepName: string | null;
        latestResult: string | null;
        nextStepName: string | null;
        canMoveNext: boolean;
        statusType: import("./pipeline.config").ResultType | null;
        pipelineSteps: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            candidateRequestId: string;
            stepNumber: number;
            stepName: string;
            stepDate: Date | null;
            stepResult: string | null;
            stepNote: string | null;
            updatedBy: string | null;
        }[];
        id: string;
        isActive: boolean;
        candidateId: string;
        requestId: string;
        currentStep: number;
        overallStatus: string | null;
        matchedBy: string;
        matchedAt: Date;
    }>;
    private findCandidateRequest;
    private logActivity;
}
