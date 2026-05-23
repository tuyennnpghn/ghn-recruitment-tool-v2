"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAGE_RESULT_OPTIONS = exports.PIPELINE_CONFIG = exports.PIPELINE_STAGES = void 0;
exports.getResultConfig = getResultConfig;
exports.computeDerivedFields = computeDerivedFields;
exports.PIPELINE_STAGES = [
    'Successfully Approached',
    'Submitted CV',
    'HR Screening',
    'Send to HM',
    'HM Feedback CV',
    'Interview 1',
    'Interview 2',
    'Interview 3',
    'Offer to Candidate',
    'Onboard Status',
];
exports.PIPELINE_CONFIG = {
    'Successfully Approached': {
        'Open to process with GHN': { type: 'continue', nextStep: 2 },
        'Not open for new job': { type: 'terminal' },
        'Have new job recently': { type: 'terminal' },
        'Open to work but no interest with GHN': { type: 'terminal' },
    },
    'Submitted CV': {
        Contact: { type: 'continue', nextStep: 3 },
        Skip: { type: 'terminal' },
    },
    'HR Screening': {
        'CV fit and continue to process': { type: 'continue', nextStep: 4 },
        'CV fit but reject to process': { type: 'terminal' },
        'Not fit': { type: 'terminal' },
        "Can't contact": { type: 'terminal' },
    },
    'Send to HM': {
        Sent: { type: 'continue', nextStep: 5 },
        'Waiting for send': { type: 'waiting' },
    },
    'HM Feedback CV': {
        Qualified: { type: 'continue', nextStep: 6 },
        Unqualified: { type: 'terminal' },
    },
    'Interview 1': {
        Pass: { type: 'continue', nextStep: 7 },
        Fail: { type: 'terminal' },
        Cancel: { type: 'terminal' },
        Saved: { type: 'waiting' },
        Waiting: { type: 'waiting' },
    },
    'Interview 2': {
        Pass: { type: 'continue', nextStep: 8 },
        Fail: { type: 'terminal' },
        Cancel: { type: 'terminal' },
        Saved: { type: 'waiting' },
        Waiting: { type: 'waiting' },
    },
    'Interview 3': {
        Pass: { type: 'continue', nextStep: 9 },
        Fail: { type: 'terminal' },
        Cancel: { type: 'terminal' },
        Saved: { type: 'waiting' },
        Waiting: { type: 'waiting' },
    },
    'Offer to Candidate': {
        'Candidate accept offer': { type: 'continue', nextStep: 10 },
        'Waiting candidate feedback': { type: 'waiting' },
        'Waiting internal discussion': { type: 'waiting' },
        'Candidate reject offer': { type: 'terminal' },
    },
    'Onboard Status': {
        Onboarded: { type: 'completed' },
        'Waiting onboard': { type: 'waiting' },
        'Reject onboard': { type: 'terminal' },
        'Onboarded (BCKD) - Drop ≤ 7D': { type: 'completed' },
    },
};
exports.STAGE_RESULT_OPTIONS = Object.fromEntries(Object.entries(exports.PIPELINE_CONFIG).map(([stage, results]) => [stage, Object.keys(results)]));
function getResultConfig(stageName, result) {
    return exports.PIPELINE_CONFIG[stageName]?.[result] ?? null;
}
function computeDerivedFields(steps) {
    const completedSteps = steps.filter((s) => s.stepResult !== null);
    if (completedSteps.length === 0) {
        return {
            latestCompletedStep: null,
            latestCompletedStepName: null,
            latestResult: null,
            nextStepName: null,
            canMoveNext: false,
            statusType: null,
        };
    }
    const latest = completedSteps.reduce((max, s) => (s.stepNumber > max.stepNumber ? s : max));
    const config = getResultConfig(latest.stepName, latest.stepResult);
    const statusType = config?.type ?? null;
    let nextStepName = null;
    let canMoveNext = false;
    if (config) {
        switch (config.type) {
            case 'continue':
                nextStepName = config.nextStep ? exports.PIPELINE_STAGES[config.nextStep - 1] : null;
                canMoveNext = true;
                break;
            case 'waiting':
                nextStepName = 'Waiting';
                break;
            case 'terminal':
                nextStepName = 'Closed';
                break;
            case 'completed':
                nextStepName = 'Completed';
                break;
        }
    }
    return {
        latestCompletedStep: latest.stepNumber,
        latestCompletedStepName: latest.stepName,
        latestResult: latest.stepResult,
        nextStepName,
        canMoveNext,
        statusType,
    };
}
//# sourceMappingURL=pipeline.config.js.map