export type ResultType = 'continue' | 'waiting' | 'terminal' | 'completed';
export interface ResultConfig {
    type: ResultType;
    nextStep?: number;
}
export declare const PIPELINE_STAGES: readonly ["Successfully Approached", "Submitted CV", "HR Screening", "Send to HM", "HM Feedback CV", "Interview 1", "Interview 2", "Interview 3", "Offer to Candidate", "Onboard Status"];
export type PipelineStageName = (typeof PIPELINE_STAGES)[number];
export declare const PIPELINE_CONFIG: Record<PipelineStageName, Record<string, ResultConfig>>;
export declare const STAGE_RESULT_OPTIONS: Record<string, string[]>;
export declare function getResultConfig(stageName: string, result: string): ResultConfig | null;
export interface DerivedPipelineFields {
    latestCompletedStep: number | null;
    latestCompletedStepName: string | null;
    latestResult: string | null;
    nextStepName: string | null;
    canMoveNext: boolean;
    statusType: ResultType | null;
}
interface StepLike {
    stepNumber: number;
    stepName: string;
    stepResult: string | null;
}
export declare function computeDerivedFields(steps: StepLike[]): DerivedPipelineFields;
export {};
