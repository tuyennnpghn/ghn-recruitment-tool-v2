"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunnelReportDto = exports.FunnelInterviewPassRatesDto = exports.FunnelConversionRateItemDto = exports.FunnelStageBreakdownItemDto = void 0;
class FunnelStageBreakdownItemDto {
    stepNumber;
    count;
}
exports.FunnelStageBreakdownItemDto = FunnelStageBreakdownItemDto;
class FunnelConversionRateItemDto {
    fromStep;
    toStep;
    rate;
}
exports.FunnelConversionRateItemDto = FunnelConversionRateItemDto;
class FunnelInterviewPassRatesDto {
    interview1;
    interview2;
    interview3;
}
exports.FunnelInterviewPassRatesDto = FunnelInterviewPassRatesDto;
class FunnelReportDto {
    totalCandidates;
    pendingCount;
    stageBreakdown;
    conversionRates;
    interviewPassRates;
    offerAcceptanceRate;
    onboardSuccessRate;
    overallConvRate;
}
exports.FunnelReportDto = FunnelReportDto;
//# sourceMappingURL=funnel-response.dto.js.map