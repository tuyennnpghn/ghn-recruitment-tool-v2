import type { FunnelReportDto, PipelineStepNumber } from './dto/funnel-response.dto';
interface StepRecord {
    stepNumber: number;
    stepResult: string | null;
}
interface CandidateRecord {
    pipelineSteps: StepRecord[];
}
export declare function isValidStepNumber(n: number): n is PipelineStepNumber;
export declare function computeFunnelReport(rows: CandidateRecord[]): FunnelReportDto;
export {};
