"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidStepNumber = isValidStepNumber;
exports.computeFunnelReport = computeFunnelReport;
const pipeline_config_1 = require("../pipeline/pipeline.config");
const RESULT_PASS = 'Pass';
const RESULT_FAIL = 'Fail';
const RESULT_OFFER_ACCEPTED = 'Candidate accept offer';
const RESULT_OFFER_REJECTED = 'Candidate reject offer';
const RESULT_ONBOARDED = 'Onboarded';
const RESULT_ONBOARD_BCKD = 'Onboarded (BCKD) - Drop ≤ 7D';
const CONVERSION_PAIRS = [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
    { from: 5, to: 6 },
    { from: 6, to: 7 },
    { from: 7, to: 8 },
    { from: 8, to: 9 },
    { from: 9, to: 10 },
];
function isValidStepNumber(n) {
    return Number.isInteger(n) && n >= 1 && n <= 10;
}
function latestCompletedStep(steps) {
    const withResults = steps.filter((s) => s.stepResult !== null);
    if (withResults.length === 0)
        return null;
    const latest = withResults.reduce((max, s) => (s.stepNumber > max ? s.stepNumber : max), 0);
    if (!isValidStepNumber(latest)) {
        throw new Error(`Unexpected step number ${latest} in pipeline data — expected 1–10.`);
    }
    return latest;
}
function resultAt(steps, stepNumber) {
    return steps.find((s) => s.stepNumber === stepNumber)?.stepResult ?? null;
}
function hasResultAt(steps, stepNumber) {
    return steps.some((s) => s.stepNumber === stepNumber && s.stepResult !== null);
}
function safeRate(numerator, denominator) {
    return denominator === 0 ? null : numerator / denominator;
}
function computeFunnelReport(rows) {
    const totalCandidates = rows.length;
    const snapshotCounts = new Array(10).fill(0);
    let pendingCount = 0;
    for (const row of rows) {
        const latest = latestCompletedStep(row.pipelineSteps);
        if (latest === null) {
            pendingCount++;
        }
        else {
            snapshotCounts[latest - 1]++;
        }
    }
    const stageBreakdown = pipeline_config_1.PIPELINE_STAGES.map((_, idx) => {
        const stepNumber = idx + 1;
        if (!isValidStepNumber(stepNumber)) {
            throw new Error(`PIPELINE_STAGES produced step number ${stepNumber} — expected 1–10. Update funnel.helper.ts.`);
        }
        return { stepNumber, count: snapshotCounts[idx] };
    });
    const conversionRates = CONVERSION_PAIRS.map(({ from, to }) => {
        const entered = rows.filter((r) => hasResultAt(r.pipelineSteps, from)).length;
        const converted = rows.filter((r) => hasResultAt(r.pipelineSteps, to)).length;
        return { fromStep: from, toStep: to, rate: safeRate(converted, entered) };
    });
    function interviewPassRate(stepNumber) {
        let pass = 0;
        let fail = 0;
        for (const row of rows) {
            const result = resultAt(row.pipelineSteps, stepNumber);
            if (result === RESULT_PASS)
                pass++;
            else if (result === RESULT_FAIL)
                fail++;
        }
        return safeRate(pass, pass + fail);
    }
    const interviewPassRates = {
        interview1: interviewPassRate(6),
        interview2: interviewPassRate(7),
        interview3: interviewPassRate(8),
    };
    let offerAccepted = 0;
    let offerRejected = 0;
    for (const row of rows) {
        const result = resultAt(row.pipelineSteps, 9);
        if (result === RESULT_OFFER_ACCEPTED)
            offerAccepted++;
        else if (result === RESULT_OFFER_REJECTED)
            offerRejected++;
    }
    const offerAcceptanceRate = safeRate(offerAccepted, offerAccepted + offerRejected);
    let onboardSuccess = 0;
    let onboardTotal = 0;
    for (const row of rows) {
        const result = resultAt(row.pipelineSteps, 10);
        if (result !== null) {
            onboardTotal++;
            if (result === RESULT_ONBOARDED)
                onboardSuccess++;
        }
    }
    const onboardSuccessRate = safeRate(onboardSuccess, onboardTotal);
    const onboardedCount = rows.filter((r) => resultAt(r.pipelineSteps, 10) === RESULT_ONBOARDED).length;
    const overallConvRate = totalCandidates === 0 ? 0 : onboardedCount / totalCandidates;
    return {
        totalCandidates,
        pendingCount,
        stageBreakdown,
        conversionRates,
        interviewPassRates,
        offerAcceptanceRate,
        onboardSuccessRate,
        overallConvRate,
    };
}
//# sourceMappingURL=funnel.helper.js.map