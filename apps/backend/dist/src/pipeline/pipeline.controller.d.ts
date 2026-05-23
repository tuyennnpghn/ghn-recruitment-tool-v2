import { PipelineService } from './pipeline.service';
import { MatchCandidateDto } from './dto/match-candidate.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { MoveStageDto } from './dto/move-stage.dto';
import { UpdateOverallStatusDto } from './dto/update-overall-status.dto';
export declare class PipelineController {
    private readonly svc;
    constructor(svc: PipelineService);
    match(dto: MatchCandidateDto, user: any): Promise<{
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
    findOne(id: string): Promise<{
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
    unmatch(id: string, user: any): Promise<{
        message: string;
    }>;
    updateStep(id: string, stepNumber: number, dto: UpdateStepDto, user: any): Promise<{
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
    moveStage(id: string, dto: MoveStageDto, user: any): Promise<{
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
    updateOverallStatus(id: string, dto: UpdateOverallStatusDto, user: any): Promise<{
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
}
