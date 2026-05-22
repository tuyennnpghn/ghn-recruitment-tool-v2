// Request Status
export type RequestStatus = 'Opening' | 'Pending' | 'Accepted offer' | 'Done' | 'Close';

// Type of Recruitment
export type RecruitmentType = 'New HC' | 'Replacement';

// Candidate overall status (per pipeline)
export type CandidateOverallStatus =
  | 'Onboarded'
  | 'Waiting Onboard'
  | 'Reject Onboard'
  | 'Onboarded (BCKD) - Drop ≤ 7D'
  | 'Closed';

// Pipeline step results per step
export type StepResult =
  | 'Interested'
  | 'Not Interested'
  | 'Pass'
  | 'Fail'
  | 'Hold'
  | 'Sent'
  | 'Waiting HM Feedback'
  | 'Cancel'
  | 'N/A'
  | 'Accepted'
  | 'Rejected'
  | 'Onboarded'
  | 'Waiting Onboard'
  | 'Reject Onboard';

// Pipeline step names (ordered)
export const PIPELINE_STEPS = [
  { number: 1, name: 'Successfully Approached' },
  { number: 2, name: 'Submitted CV' },
  { number: 3, name: 'HR Screening' },
  { number: 4, name: 'Send to HM' },
  { number: 5, name: 'HM Feedback CV' },
  { number: 6, name: 'Interview 1' },
  { number: 7, name: 'Interview 2' },
  { number: 8, name: 'Interview 3' },
  { number: 9, name: 'Offer to Candidate' },
  { number: 10, name: 'Onboard Status' },
] as const;

// Valid results per step
export const STEP_RESULTS: Record<number, string[]> = {
  1: ['Interested', 'Not Interested'],
  2: [], // date only
  3: ['Pass', 'Fail'],
  4: ['Sent', 'Waiting HM Feedback'],
  5: ['Pass', 'Fail', 'Hold'],
  6: ['Pass', 'Fail', 'Cancel'],
  7: ['Pass', 'Fail', 'Cancel'],
  8: ['Pass', 'Fail', 'Cancel', 'N/A'],
  9: ['Accepted', 'Rejected'],
  10: ['Onboarded', 'Waiting Onboard', 'Reject Onboard'],
};

// State machine — valid transitions
export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  'Opening':        ['Pending', 'Accepted offer', 'Close'],
  'Pending':        ['Opening', 'Close'],
  'Accepted offer': ['Done', 'Close'],
  'Done':           ['Close'],
  'Close':          [], // TERMINAL
};

// Roles
export type UserRole = 'admin' | 'hrbp';

// Lead-time status
export type LeadtimeStatus = 'Within leadtime' | 'Over leadtime' | 'N/A';
