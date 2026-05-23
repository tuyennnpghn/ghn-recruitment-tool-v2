export type PipelineStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export declare class FunnelStageBreakdownItemDto {
    stepNumber: PipelineStepNumber;
    count: number;
}
export declare class FunnelConversionRateItemDto {
    fromStep: PipelineStepNumber;
    toStep: PipelineStepNumber;
    rate: number | null;
}
export declare class FunnelInterviewPassRatesDto {
    interview1: number | null;
    interview2: number | null;
    interview3: number | null;
}
export declare class FunnelReportDto {
    totalCandidates: number;
    pendingCount: number;
    stageBreakdown: FunnelStageBreakdownItemDto[];
    conversionRates: FunnelConversionRateItemDto[];
    interviewPassRates: FunnelInterviewPassRatesDto;
    offerAcceptanceRate: number | null;
    onboardSuccessRate: number | null;
    overallConvRate: number;
}
