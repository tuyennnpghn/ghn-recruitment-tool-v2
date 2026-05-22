/**
 * GHN Recruitment Tool — API Service Layer
 * Wraps all axios calls to NestJS backend.
 * Import from here in components/pages — never call axios directly.
 */

import api from './api'
import type {
  // Auth
  LoginRequest,
  LoginResponse,
  AuthUser,
  // Request
  RequestListItem,
  RequestDetail,
  SharedHrbp,
  CreateRequestBody,
  UpdateRequestBody,
  CloseRequestBody,
  // Candidate
  CandidateListItem,
  CandidateDetail,
  CreateCandidateBody,
  CandidateCvVersion,
  // Pipeline
  RequestCandidateItem,
  UpdatePipelineStepBody,
  MoveStageBody,
  UpdateOverallStatusBody,
  MatchCandidateBody,
  // Activity
  ActivityLogEntry,
  // Notification
  NotificationItem,
  // Master data
  Department,
  JobTitle,
  Level,
  // Dashboard
  DashboardMetrics,
  // Funnel
  FunnelReport,
  // Common
  PaginatedResponse,
} from '@/types/api'
import { PIPELINE_STAGES } from '@/types/api'

// ─── Auth ──────────────────────────────────────────────────────────────────

export const authService = {
  login: (body: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', body).then((r) => r.data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<AuthUser>('/auth/me').then((r) => r.data),

  listUsers: () => api.get<AuthUser[]>('/auth/users').then((r) => r.data),
}

// ─── Requests ──────────────────────────────────────────────────────────────

export interface RequestListParams {
  page?: number
  limit?: number
  status?: string
  department?: string
  recruiter?: string
  month?: string    // YYYY-MM
  search?: string
}

/** Normalise backend {items, meta} → {data, total, page, limit} */
function normalisePage<T>(raw: any): { data: T[]; total: number; page: number; limit: number } {
  // Backend returns: { items: T[], meta: { total, page, limit, totalPages } }
  if (raw?.items !== undefined) {
    return { data: raw.items, total: raw.meta?.total ?? raw.items.length, page: raw.meta?.page ?? 1, limit: raw.meta?.limit ?? 20 }
  }
  // Fallback if already normalised
  if (raw?.data !== undefined) return raw
  // Plain array
  if (Array.isArray(raw)) return { data: raw, total: raw.length, page: 1, limit: raw.length }
  return { data: [], total: 0, page: 1, limit: 20 }
}

export const requestService = {
  list: (params?: RequestListParams) =>
    api.get('/requests', { params }).then((r) => normalisePage<RequestListItem>(r.data)),

  // Backend stores shared HRBPs as flat relations (shared1/shared2/shared3);
  // normalise into the SharedHrbp[] array the frontend RequestDetail type expects.
  get: (id: string) =>
    api.get<any>(`/requests/${id}`).then((r) => {
      const raw = r.data
      const shared: SharedHrbp[] = [
        raw.shared1 && { userId: raw.shared1.id, fullName: raw.shared1.fullName, sharedDate: raw.shared1Date ?? '' },
        raw.shared2 && { userId: raw.shared2.id, fullName: raw.shared2.fullName, sharedDate: raw.shared2Date ?? '' },
        raw.shared3 && { userId: raw.shared3.id, fullName: raw.shared3.fullName, sharedDate: raw.shared3Date ?? '' },
      ].filter(Boolean) as SharedHrbp[]
      return { ...raw, shared } as RequestDetail
    }),

  create: (body: CreateRequestBody) =>
    api.post<RequestDetail>('/requests', body).then((r) => r.data),

  update: (id: string, body: UpdateRequestBody) =>
    api.patch<RequestDetail>(`/requests/${id}`, body).then((r) => r.data),

  /** Pending → Opening — auto-sets pendingEndDate + pendingDays */
  resume: (id: string) =>
    api.post<RequestDetail>(`/requests/${id}/resume`).then((r) => r.data),

  /** Requires all candidates to be Closed first */
  close: (id: string, body: CloseRequestBody) =>
    api.post<RequestDetail>(`/requests/${id}/close`, body).then((r) => r.data),

  archive: (id: string) =>
    api.post(`/requests/${id}/archive`),

  /**
   * Returns all active CandidateRequests for a request, with full pipeline steps.
   * Served by PipelineController — GET /pipeline/request/:requestId.
   */
  getCandidates: (requestId: string) =>
    api.get<RequestCandidateItem[]>(`/pipeline/request/${requestId}`).then((r) => r.data),

  getFunnelReport: (requestId: string) =>
    api.get<FunnelReport>(`/requests/${requestId}/funnel`).then((r) => r.data),

  // Master-data endpoints — used by form dropdowns
  getDepartments: () =>
    api.get<Department[]>('/requests/meta/departments').then((r) => r.data),

  getLevels: () =>
    api.get<Level[]>('/requests/meta/levels').then((r) => r.data),

  /** Returns active users only (server-filtered). Shape: {id, fullName, email, role} */
  getRecruiters: () =>
    api
      .get<Array<{ id: string; fullName: string; email: string; role: string }>>(
        '/requests/meta/users',
      )
      .then((r) => r.data),

  getJobTitlesByDepartment: (departmentId: string) =>
    api
      .get<JobTitle[]>(`/requests/meta/departments/${departmentId}/job-titles`)
      .then((r) => r.data),
}

// ─── Candidates ────────────────────────────────────────────────────────────

export interface CandidateListParams {
  page?: number
  limit?: number
  pic?: string
  source?: string
  isBlacklisted?: boolean
  search?: string   // matches name | email | phone
}

export const candidateService = {
  list: (params?: CandidateListParams) =>
    api.get('/candidates', { params }).then((r) => normalisePage<CandidateListItem>(r.data)),

  get: (id: string) =>
    api.get(`/candidates/${id}`).then((r) => r.data as CandidateDetail),

  create: (body: CreateCandidateBody) =>
    api.post('/candidates', body).then((r) => r.data as CandidateDetail),

  update: (id: string, body: Partial<CreateCandidateBody>) =>
    api.patch(`/candidates/${id}`, body).then((r) => r.data as CandidateDetail),

  archive: (id: string) =>
    api.post(`/candidates/${id}/archive`),

  restore: (id: string) =>
    api.post(`/candidates/${id}/restore`),

  /** Upload CV file — backend stores in Supabase private bucket */
  uploadCv: (candidateId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post<CandidateCvVersion>(`/candidates/${candidateId}/cv`, form, {
        headers: { 'Content-Type': undefined },
      })
      .then((r) => r.data)
  },

  /** Get time-limited signed URL for a specific CV version */
  getCvSignedUrl: (candidateId: string, cvId: string) =>
    api
      .get<{ signedUrl: string }>(`/candidates/cv/${cvId}/signed-url`)
      .then((r) => r.data.signedUrl),

  getCvSources: () =>
    api.get<Array<{ id: string; name: string }>>('/candidates/meta/cv-sources').then((r) => r.data),
}

// ─── Pipeline ──────────────────────────────────────────────────────────────

export const pipelineService = {
  /** Match a candidate into a request — starts pipeline at step 1 */
  match: (body: MatchCandidateBody) =>
    api.post('/pipeline/match', body).then((r) => r.data),

  /** Unmatch a candidate from a request */
  unmatch: (candidateRequestId: string) =>
    api.delete(`/pipeline/${candidateRequestId}`),

  /** Update result / date / note for a specific step */
  updateStep: (candidateRequestId: string, stepNumber: number, body: UpdatePipelineStepBody) =>
    api
      .patch(`/pipeline/${candidateRequestId}/steps/${stepNumber}`, body)
      .then((r) => r.data),

  /**
   * Move candidate to a new stage.
   * Callers pass a human-readable stage name (targetStage); the service converts
   * it to the 1-based step number the backend expects (targetStep).
   */
  moveStage: (candidateRequestId: string, body: MoveStageBody) => {
    // PIPELINE_STAGES is the canonical ordered list — index + 1 gives the step number
    const targetStep = PIPELINE_STAGES.indexOf(body.targetStage) + 1
    if (targetStep === 0) {
      return Promise.reject(new Error(`Invalid stage: "${body.targetStage}"`))
    }
    return api
      .post(`/pipeline/${candidateRequestId}/move-stage`, { targetStep, note: body.note })
      .then((r) => r.data)
  },

  /** Update overall/final status (Onboarded, Closed, etc.) */
  updateOverallStatus: (candidateRequestId: string, body: UpdateOverallStatusBody) =>
    api
      .patch(`/pipeline/${candidateRequestId}/overall-status`, body)
      .then((r) => r.data),
}

// ─── Activity Log ──────────────────────────────────────────────────────────

export interface ActivityLogParams {
  page?: number
  limit?: number
  entityType?: string
  entityId?: string
  userId?: string
}

export const activityService = {
  list: (params?: ActivityLogParams) =>
    api.get<PaginatedResponse<ActivityLogEntry>>('/activity-logs', { params }).then((r) => r.data),
}

// ─── Notifications ─────────────────────────────────────────────────────────

export const notificationService = {
  list: () =>
    api.get<NotificationItem[]>('/notifications').then((r) => r.data),

  markRead: (id: string) =>
    api.post(`/notifications/${id}/read`),

  markAllRead: () =>
    api.post('/notifications/read-all'),
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export const dashboardService = {
  metrics: () =>
    api.get<DashboardMetrics>('/dashboard/metrics').then((r) => r.data),
}

// ─── Admin — Master Data ───────────────────────────────────────────────────

export const adminService = {
  // Users
  listUsers: () => api.get('/admin/users').then((r) => r.data),
  createUser: (body: { email: string; fullName: string; role: string; password: string }) =>
    api.post('/admin/users', body).then((r) => r.data),
  updateUser: (id: string, body: Partial<{ isActive: boolean; role: string; fullName: string; email: string }>) =>
    api.patch(`/admin/users/${id}`, body).then((r) => r.data),
  resetPassword: (id: string, newPassword: string) =>
    api.post(`/admin/users/${id}/reset-password`, { newPassword }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  // Activity Audit
  listActivityLogs: (params?: {
    page?: number; limit?: number
    entityType?: string; userId?: string; action?: string
    from?: string; to?: string
  }) => api.get('/admin/audit', { params }).then((r) => r.data),

  // Departments
  listDepartments: () => api.get('/admin/departments').then((r) => r.data),
  createDepartment: (code: string, name: string) =>
    api.post('/admin/departments', { code, name }).then((r) => r.data),
  updateDepartment: (id: string, data: { code?: string; name?: string }) =>
    api.patch(`/admin/departments/${id}`, data).then((r) => r.data),
  deleteDepartment: (id: string) => api.delete(`/admin/departments/${id}`),

  // Levels
  listLevels: () => api.get('/admin/levels').then((r) => r.data),
  createLevel: (name: string, leadTimeDays?: number | null) =>
    api.post('/admin/levels', { name, leadTimeDays }).then((r) => r.data),
  updateLevel: (id: string, name: string, leadTimeDays?: number | null) =>
    api.patch(`/admin/levels/${id}`, { name, leadTimeDays }).then((r) => r.data),
  deleteLevel: (id: string) => api.delete(`/admin/levels/${id}`),

  // CV Sources
  listCvSources: () => api.get('/admin/cv-sources').then((r) => r.data),
  createCvSource: (name: string) =>
    api.post('/admin/cv-sources', { name }).then((r) => r.data),
  updateCvSource: (id: string, name: string) =>
    api.patch(`/admin/cv-sources/${id}`, { name }).then((r) => r.data),
  deleteCvSource: (id: string) => api.delete(`/admin/cv-sources/${id}`),

  // Job Titles
  listJobTitles: (departmentId?: string) =>
    api.get('/admin/job-titles', { params: { departmentId } }).then((r) => r.data),
  createJobTitle: (departmentId: string, title: string, sGrade?: string | null) =>
    api.post('/admin/job-titles', { departmentId, title, sGrade }).then((r) => r.data),
  updateJobTitle: (id: string, data: { title?: string; sGrade?: string | null }) =>
    api.patch(`/admin/job-titles/${id}`, data).then((r) => r.data),
  deleteJobTitle: (id: string) => api.delete(`/admin/job-titles/${id}`),

  // Tracks
  listTracks: () => api.get('/admin/tracks').then((r) => r.data),
  createTrack: (name: string) => api.post('/admin/tracks', { name }).then((r) => r.data),
  updateTrack: (id: string, name: string) =>
    api.patch(`/admin/tracks/${id}`, { name }).then((r) => r.data),
  deleteTrack: (id: string) => api.delete(`/admin/tracks/${id}`),

  // Sub Tracks
  listSubTracks: () => api.get('/admin/sub-tracks').then((r) => r.data),
  createSubTrack: (name: string) => api.post('/admin/sub-tracks', { name }).then((r) => r.data),
  updateSubTrack: (id: string, name: string) =>
    api.patch(`/admin/sub-tracks/${id}`, { name }).then((r) => r.data),
  deleteSubTrack: (id: string) => api.delete(`/admin/sub-tracks/${id}`),

  // Holiday Calendar
  listHolidays: () => api.get('/admin/holidays').then((r) => r.data),
  addHoliday: (body: { holidayDate: string; description: string }) =>
    api.post('/admin/holidays', body).then((r) => r.data),
  deleteHoliday: (id: string) => api.delete(`/admin/holidays/${id}`),

  // Storage
  storageUsage: () => api.get('/admin/storage/usage').then((r) => r.data),

  // Archive / Restore
  listArchived: () => api.get('/admin/archived').then((r) => r.data),
  restore: (entityType: 'request' | 'candidate', id: string) =>
    api.post(`/admin/archived/${entityType}/${id}/restore`),
}
