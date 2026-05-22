/**
 * GHN Recruitment Tool — Frontend API Types
 * Source of truth: docs/requirements.md + prisma/schema.prisma
 * These types represent API response shapes from the NestJS backend.
 * Do NOT import from mock-data.ts in production code.
 */

// ─── Enums / Unions ────────────────────────────────────────────────────────

/** Request No. format: YY_MãPhòng_NNNN  e.g. 26_PRO_0001 */
export type RequestNo = string

/** 5 canonical request statuses — requirements.md §5 Module 1 */
export type RequestStatus =
  | 'Opening'
  | 'Pending'
  | 'Accepted offer'
  | 'Done'
  | 'Close'

/** 10 pipeline stages in mandatory order — requirements.md §5 Module 1 ③ */
export type CandidateStage =
  | 'Successfully Approached'
  | 'Submitted CV'
  | 'HR Screening'
  | 'Send to HM'
  | 'HM Feedback CV'
  | 'Interview 1'
  | 'Interview 2'
  | 'Interview 3'
  | 'Offer to Candidate'
  | 'Onboard Status'

/**
 * Result options per stage — requirements.md §5 Module 1 ③
 * Each stage has its own allowed result values.
 * Backend enforces this; frontend filters dropdown accordingly.
 */
export const STAGE_RESULT_OPTIONS: Record<CandidateStage, string[]> = {
  'Successfully Approached': [
    'Open to process with GHN',
    'Not open for new job',
    'Have new job recently',
    'Open to work but no interest with GHN',
  ],
  'Submitted CV': ['Contact', 'Skip'],
  'HR Screening': [
    'CV fit and continue to process',
    'CV fit but reject to process',
    'Not fit',
    "Can't contact",
  ],
  'Send to HM': ['Sent', 'Waiting for send'],
  'HM Feedback CV': ['Qualified', 'Unqualified'],
  'Interview 1': ['Pass', 'Fail', 'Cancel', 'Saved', 'Waiting'],
  'Interview 2': ['Pass', 'Fail', 'Cancel', 'Saved', 'Waiting'],
  'Interview 3': ['Pass', 'Fail', 'Cancel', 'Saved', 'Waiting'],
  'Offer to Candidate': [
    'Candidate accept offer',
    'Waiting candidate feedback',
    'Waiting internal discussion',
    'Candidate reject offer',
  ],
  'Onboard Status': [
    'Onboarded',
    'Waiting onboard',
    'Reject onboard',
    'Onboarded (BCKD) - Drop ≤ 7D',
  ],
}

/** Ordered list of all pipeline stages */
export const PIPELINE_STAGES: CandidateStage[] = [
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
]

/**
 * Overall pipeline status for a CandidateRequest.
 * Set by the backend at key lifecycle events:
 *   'In Progress' — on match (default)
 *   'Offer'       — manually via updateOverallStatus
 *   'On Hold'     — manually via updateOverallStatus
 *   'Onboarded'   — auto-set when step 10 result = 'Onboarded'
 *   'Closed'      — on unmatch, or manually via updateOverallStatus
 * Note: step-level results (e.g. 'Waiting onboard') are PipelineStep.stepResult values,
 * not overallStatus values.
 */
export type CandidateOverallStatus =
  | 'In Progress'
  | 'Offer'
  | 'On Hold'
  | 'Onboarded'
  | 'Closed'

/** Result type returned by backend pipeline state machine for a completed step */
export type ResultType = 'continue' | 'waiting' | 'terminal' | 'completed'

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: 'admin' | 'hrbp'
  isActive: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

// ─── Common ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ApiError {
  statusCode: number
  message: string
  error?: string
}

// ─── Master Data ───────────────────────────────────────────────────────────

export interface Department {
  id: string
  code: string
  name: string
}

export interface JobTitle {
  id: string
  departmentId: string
  title: string
  sGrade: string | null
}

export interface Level {
  id: string
  name: string
  leadTimeDays: number | null // null = Consultant (Project-based) = N/A
}

export interface CvSource {
  id: string
  name: string
}

export interface HrbpUser {
  id: string
  fullName: string
  email: string
  isActive: boolean
}

// ─── Request ───────────────────────────────────────────────────────────────

export interface SharedHrbp {
  userId: string
  fullName: string
  sharedDate: string // ISO date
}

/**
 * Full Request entity returned by GET /requests/:id
 * Includes computed fields: actualLeadTime, leadTimeStatus
 */
export interface RequestDetail {
  id: string
  requestNo: RequestNo
  codeDept: string
  openDate: string             // ISO date
  department: Pick<Department, 'id' | 'name'>
  section: string | null
  team: string | null
  jobTitle: Pick<JobTitle, 'id' | 'title' | 'sGrade'> | null
  level: Pick<Level, 'id' | 'name' | 'leadTimeDays'> | null
  sGrade: string | null
  hiringManager: string | null
  recruiter: Pick<HrbpUser, 'id' | 'fullName'>
  shared: SharedHrbp[]         // 0–3 shared HRBPs
  typeOfRecruitment: 'New HC' | 'Replacement'
  replaceFor: string | null
  status: RequestStatus
  cddAcceptedOfferDate: string | null   // ISO date
  pendingStartDate: string | null
  pendingEndDate: string | null
  pendingDays: number | null
  pendingReason: string | null
  closeReason: string | null
  note: string | null
  isArchived: boolean
  createdAt: string
  updatedAt: string
  // Computed at API response time
  actualLeadTime: number | null      // null when level = Consultant
  leadTimeStatus: 'Within leadtime' | 'Over leadtime' | null
  candidateCount: number
  offeredCount: number
  onboardedCount: number
}

/**
 * List item for GET /requests (lighter payload).
 * Backend returns nested objects for jobTitle/department/recruiter/shared*.
 */
export interface RequestListItem {
  id: string
  requestNo: RequestNo
  jobTitle: { id: string; title: string; sGrade: string | null } | null
  department: string            // department.name (object at runtime — use asStr())
  level: string | null
  recruiter: string             // recruiter.fullName (object at runtime — use asStr())
  // Flat shared-HRBP relations returned by the list endpoint
  shared1: { id: string; fullName: string } | null
  shared2: { id: string; fullName: string } | null
  shared3: { id: string; fullName: string } | null
  shared1Date: string | null
  shared2Date: string | null
  shared3Date: string | null
  status: RequestStatus
  openDate: string
  daysOpen: number              // computed
  _count: { candidateRequests: number }
  offeredCount: number
  onboardedCount: number
  actualLeadTimeDays: number | null
  leadTimeStatus: 'Within leadtime' | 'Over leadtime' | null
  isConsultant: boolean         // level.leadTimeDays === null
}

export interface CreateRequestBody {
  openDate: string
  departmentId: string
  section?: string
  team?: string
  jobTitleId?: string
  levelId?: string
  trackId?: string
  subTrackId?: string
  hiringManager?: string
  recruiterId: string
  shared1Id?: string
  shared2Id?: string
  shared3Id?: string
  typeOfRecruitment: 'New HC' | 'Replacement'
  replaceFor?: string
  note?: string
}

export interface UpdateRequestBody extends Partial<CreateRequestBody> {
  status?: RequestStatus
  cddAcceptedOfferDate?: string
  pendingStartDate?: string
  pendingEndDate?: string
  pendingReason?: string
  note?: string
}

export interface CloseRequestBody {
  closeReason: string
}

// ─── Candidate ─────────────────────────────────────────────────────────────

export interface CandidateListItem {
  id: string
  fullName: string
  email?: string
  phone?: string
  pic: Pick<HrbpUser, 'id' | 'fullName'>
  /** Backend returns full object: { id, name } — not a plain string */
  cvSource: Pick<CvSource, 'id' | 'name'> | null
  sGrade: string | null
  industry: string | null
  currentCompany: string | null
  cvLink?: string | null
  cvs?: { id: string }[]
  isBlacklisted: boolean
  /** Prisma _count relation — use _count.candidateRequests for the number of active matches */
  _count: { candidateRequests: number }
  /** Active candidateRequests — used to derive stage in the list view */
  candidateRequests?: { overallStatus: string | null }[]
  createdAt: string
  updatedAt?: string
}

export interface CandidateDetail {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  pic: Pick<HrbpUser, 'id' | 'fullName'>
  currentCompany: string | null
  industry: string | null
  sGrade: string | null
  cvLink: string | null
  cvSource: string | null
  isBlacklisted: boolean
  blacklistReason: string | null
  currentSalary: string | null    // Decimal as string from API
  expectedSalary: string | null
  salaryNote: string | null
  cvs: CandidateCvVersion[]
  matchedRequests: CandidatePipelineItem[]  // pipeline per request
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface CandidateCvVersion {
  id: string
  fileName: string
  fileSizeBytes: number
  fileType: string
  versionNumber: number
  uploadedAt: string
  signedUrl?: string            // populated on-demand from backend
}

export interface CreateCandidateBody {
  fullName: string
  email?: string
  phone?: string
  picId: string
  currentCompany?: string
  industry?: string
  sGrade?: string
  cvLink?: string
  cvSourceId?: string
  isBlacklisted?: boolean
  blacklistReason?: string
  currentSalary?: string
  expectedSalary?: string
  salaryNote?: string
}

// ─── Pipeline ──────────────────────────────────────────────────────────────

/** One pipeline step record (maps to PipelineStep in DB) */
export interface PipelineStep {
  id: string
  stepNumber: number          // 1–10
  stepName: CandidateStage
  stepDate: string | null
  stepResult: string | null   // see STAGE_RESULT_OPTIONS for valid values
  stepNote: string | null
  updatedAt: string
}

/** Candidate pipeline within one specific Request */
export interface CandidatePipelineItem {
  candidateRequestId: string
  requestId: string
  requestNo: RequestNo
  position: string
  currentStep: number
  currentStage: CandidateStage
  overallStatus: CandidateOverallStatus | null
  isActive: boolean
  matchedAt: string
  steps: PipelineStep[]
}

/**
 * Response shape from GET /pipeline/request/:requestId
 * Matches the CANDIDATE_REQUEST_SELECT projection in pipeline.service.ts.
 * currentStage is derived in the UI as PIPELINE_STAGES[currentStep - 1].
 */
export interface RequestCandidateItem {
  /** The CandidateRequest PK — used for all subsequent pipeline API calls */
  id: string
  candidateId: string
  requestId: string
  /** 1-based index into PIPELINE_STAGES; indicates the active stage */
  currentStep: number
  overallStatus: CandidateOverallStatus | null
  isActive: boolean
  matchedBy: string
  matchedAt: string
  candidate: {
    id: string
    fullName: string
    email: string | null
    /** HRBP in charge of this candidate — not the person who performed the match */
    pic: { id: string; fullName: string } | null
  }
  request: {
    id: string
    requestNo: string
    status: string
    department: { name: string }
    jobTitle: { title: string } | null
  }
  pipelineSteps: PipelineStep[]
  // Derived fields — computed by backend state machine, no DB change
  latestCompletedStep?: number | null
  latestCompletedStepName?: string | null
  latestResult?: string | null
  nextStepName?: string | null
  canMoveNext?: boolean
  statusType?: ResultType | null
}

export interface MatchCandidateBody {
  candidateId: string
  requestId: string
  note?: string
}

export interface UpdatePipelineStepBody {
  stepDate?: string
  stepResult: string            // must be in STAGE_RESULT_OPTIONS[stepName]
  stepNote?: string
}

export interface MoveStageBody {
  targetStage: CandidateStage
  note?: string
}

export interface UpdateOverallStatusBody {
  overallStatus: CandidateOverallStatus
}

// ─── Activity Log ──────────────────────────────────────────────────────────

export interface ActivityLogEntry {
  id: string
  entityType: 'Request' | 'Candidate' | 'CandidateRequest' | 'PipelineStep'
  entityId: string
  user: Pick<HrbpUser, 'id' | 'fullName'>
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ARCHIVE' | 'RESTORE'
  changesJson: Record<string, { from: unknown; to: unknown }> | null
  createdAt: string
}

// ─── Notifications ─────────────────────────────────────────────────────────

export interface NotificationItem {
  id: string
  type: 'leadtime_alert' | 'system'
  title: string
  body: string
  createdAt: string
  isRead: boolean
}

// ─── Funnel Report ─────────────────────────────────────────────────────────

export type PipelineStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export interface FunnelStageBreakdownItem {
  stepNumber: PipelineStepNumber
  count: number
}

export interface FunnelConversionRateItem {
  fromStep: PipelineStepNumber
  toStep: PipelineStepNumber
  rate: number | null
}

export interface FunnelInterviewPassRates {
  interview1: number | null
  interview2: number | null
  interview3: number | null
}

export interface FunnelReport {
  totalCandidates: number
  pendingCount: number
  stageBreakdown: FunnelStageBreakdownItem[]
  conversionRates: FunnelConversionRateItem[]
  interviewPassRates: FunnelInterviewPassRates
  offerAcceptanceRate: number | null
  onboardSuccessRate: number | null
  overallConvRate: number
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  totalOpenRequests: number
  totalCandidatesInPipeline: number
  offersThisMonth: number
  onboardsThisMonth: number
  avgLeadTime: number | null
  requestsByStatus: Record<RequestStatus, number>
  candidatesByStage: Record<CandidateStage, number>
}
