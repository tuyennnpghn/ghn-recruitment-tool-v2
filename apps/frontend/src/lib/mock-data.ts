// Business type definitions — sourced from approved ats-ui-design/lib/mock-data.ts
// Types are production-safe. Mock arrays below are TEMPORARY — will be replaced by real API in Step 6.

export type RequestStatus = 'Opening' | 'Pending' | 'Accepted offer' | 'Done' | 'Close'

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

export type StepResult = 'Pass' | 'Fail' | 'Cancel' | 'Pending'

export type CandidateResult = string

export const stageResultMapping: Record<string, string[]> = {
  "Successfully Approached": ["Open to process with GHN", "Not open for new job", "Have new job recently", "Open to work but no interest with GHN"],
  "Submitted CV": ["Contact", "Skip"],
  "HR Screening": ["CV fit and continue to process", "CV fit but reject to process", "Not fit", "Can't contact"],
  "Send to HM": ["Sent", "Waiting for send"],
  "HM Feedback CV": ["Qualified", "Unqualified"],
  "Interview 1": ["Pass", "Fail", "Cancel", "Saved", "Waiting"],
  "Interview 2": ["Pass", "Fail", "Cancel", "Saved", "Waiting"],
  "Interview 3": ["Pass", "Fail", "Cancel", "Saved", "Waiting"],
  "Offer to Candidate": ["Candidate accept offer", "Waiting candidate feedback", "Waiting internal discussion", "Candidate reject offer"],
  "Onboard Status": ["Onboarded", "Waiting onboard", "Reject onboard", "Onboarded (BCKD) - Drop <= 7D"]
}

export interface SharedHrbp {
  name: string
  initials: string
  sharedDate: string
}

export interface RecruitmentRequest {
  id: string
  requestNo: string          // Format: YY_MãPhòng_NNNN e.g. 26_PRO_0001
  position: string
  department: string
  level: string
  recruiter: string
  status: RequestStatus
  openDate: string
  candidateCount: number
  leadtime: number
  leadtimeStandard: number
  isConsultant: boolean
  offered: number
  onboarded: number
  sharedHrbps: SharedHrbp[]
}

export interface Candidate {
  id: string
  name: string
  pic: string
  source: string
  company: string
  sGrade: string
  phone: string
  email: string
  currentRequests: string[]
  blacklist: boolean
  blacklistReason?: string
  currentStage: CandidateStage
  lastUpdated: string
  result: CandidateResult
  currentSalary: string
  expectedSalary: string
  industry: string
  cvUrl?: string
  cvLink?: string
}

export interface ActivityLogEntry {
  id: string
  date: string
  user: string
  action: string
  detail: string
}

// ─── TEMPORARY MOCK DATA — will be replaced by real API in Step 6 ─────────
// Request No. format: YY_MãPhòng_NNNN
export const mockRequests: RecruitmentRequest[] = [
  { id: '1',  requestNo: '26_ENG_0001', position: 'Senior Software Engineer',  department: 'Engineering',      level: 'Senior Engineer 1',           recruiter: 'Nguyen Thi Mai',  status: 'Opening',        openDate: '2026-01-15', candidateCount: 12, leadtime: 32, leadtimeStandard: 35, isConsultant: false, offered: 1, onboarded: 0, sharedHrbps: [{ name: 'Hoai Anh', initials: 'HA', sharedDate: '12 Mar' }, { name: 'Phuong Le', initials: 'PL', sharedDate: '15 Mar' }] },
  { id: '2',  requestNo: '26_PRO_0001', position: 'Product Manager',            department: 'Product',          level: 'Manager',                     recruiter: 'Tran Van Duc',    status: 'Pending',        openDate: '2026-01-20', candidateCount: 8,  leadtime: 27, leadtimeStandard: 50, isConsultant: false, offered: 2, onboarded: 1, sharedHrbps: [{ name: 'Nguyen Tuyen', initials: 'NT', sharedDate: '18 Mar' }, { name: 'Hoai Anh', initials: 'HA', sharedDate: '20 Mar' }, { name: 'Minh Trang', initials: 'MT', sharedDate: '22 Mar' }] },
  { id: '3',  requestNo: '26_DES_0001', position: 'UX Designer',                department: 'Design',           level: 'Specialist',                  recruiter: 'Le Thi Hoa',      status: 'Opening',        openDate: '2026-02-01', candidateCount: 15, leadtime: 18, leadtimeStandard: 30, isConsultant: false, offered: 0, onboarded: 0, sharedHrbps: [{ name: 'Nguyen Tuyen', initials: 'NT', sharedDate: '05 Mar' }] },
  { id: '4',  requestNo: '26_DAT_0001', position: 'Data Analyst',               department: 'Data',             level: 'Specialist',                  recruiter: 'Pham Minh Tuan',  status: 'Done',           openDate: '2025-12-10', candidateCount: 20, leadtime: 45, leadtimeStandard: 30, isConsultant: false, offered: 3, onboarded: 2, sharedHrbps: [] },
  { id: '5',  requestNo: '26_ENG_0002', position: 'DevOps Engineer',            department: 'Engineering',      level: 'Engineer 2',                  recruiter: 'Nguyen Thi Mai',  status: 'Pending',        openDate: '2026-02-10', candidateCount: 6,  leadtime: 14, leadtimeStandard: 30, isConsultant: false, offered: 0, onboarded: 0, sharedHrbps: [{ name: 'Phuong Le', initials: 'PL', sharedDate: '28 Feb' }, { name: 'Minh Trang', initials: 'MT', sharedDate: '01 Mar' }] },
  { id: '6',  requestNo: '26_OPS_0001', position: 'Business Analyst',           department: 'Operations',       level: 'Specialist',                  recruiter: 'Tran Van Duc',    status: 'Accepted offer', openDate: '2026-01-25', candidateCount: 10, leadtime: 35, leadtimeStandard: 30, isConsultant: false, offered: 1, onboarded: 0, sharedHrbps: [{ name: 'Hoai Anh', initials: 'HA', sharedDate: '10 Feb' }] },
  { id: '7',  requestNo: '26_ENG_0003', position: 'QA Engineer',                department: 'Engineering',      level: 'Engineer 1',                  recruiter: 'Le Thi Hoa',      status: 'Opening',        openDate: '2026-03-01', candidateCount: 4,  leadtime: 8,  leadtimeStandard: 30, isConsultant: false, offered: 0, onboarded: 0, sharedHrbps: [] },
  { id: '8',  requestNo: '26_HRD_0001', position: 'HR Coordinator',             department: 'Human Resources',  level: 'Officer',                     recruiter: 'Pham Minh Tuan',  status: 'Done',           openDate: '2025-11-15', candidateCount: 18, leadtime: 52, leadtimeStandard: 22, isConsultant: false, offered: 2, onboarded: 2, sharedHrbps: [{ name: 'Nguyen Tuyen', initials: 'NT', sharedDate: '20 Nov' }] },
  { id: '9',  requestNo: '26_MKT_0001', position: 'Marketing Specialist',       department: 'Marketing',        level: 'Specialist',                  recruiter: 'Nguyen Thi Mai',  status: 'Accepted offer', openDate: '2026-02-20', candidateCount: 9,  leadtime: 11, leadtimeStandard: 30, isConsultant: false, offered: 1, onboarded: 0, sharedHrbps: [] },
  { id: '10', requestNo: '26_OPS_0002', position: 'Logistics Manager',          department: 'Operations',       level: 'Manager',                     recruiter: 'Tran Van Duc',    status: 'Close',          openDate: '2026-01-05', candidateCount: 3,  leadtime: 40, leadtimeStandard: 50, isConsultant: false, offered: 0, onboarded: 0, sharedHrbps: [{ name: 'Minh Trang', initials: 'MT', sharedDate: '08 Jan' }] },
  { id: '11', requestNo: '26_SAL_0001', position: 'Field Sales Consultant',     department: 'Sales',            level: 'Consultant (Project-based)',   recruiter: 'Le Thi Hoa',      status: 'Opening',        openDate: '2026-03-10', candidateCount: 2,  leadtime: 0,  leadtimeStandard: 0,  isConsultant: true,  offered: 0, onboarded: 0, sharedHrbps: [] },
]

export const mockCandidates: Candidate[] = [
  { id: '1',  name: 'Nguyen Van A',  pic: 'Nguyen Thi Mai',  source: 'LinkedIn',      company: 'FPT Software',    sGrade: 'A', phone: '+84901234567', email: 'nguyenvana@gmail.com',  currentRequests: ['26_ENG_0001'], blacklist: false, currentStage: 'Interview 2',         lastUpdated: '2026-05-12', result: 'In Progress',    currentSalary: '25,000,000 VND', expectedSalary: '35,000,000 VND', industry: 'Technology' },
  { id: '2',  name: 'Tran Thi B',   pic: 'Tran Van Duc',    source: 'Referral',      company: 'Shopee',          sGrade: 'B+', phone: '+84912345678', email: 'tranthib@gmail.com',    currentRequests: ['26_PRO_0001'], blacklist: false, currentStage: 'Offer to Candidate', lastUpdated: '2026-05-10', result: 'Waiting onboard', currentSalary: '30,000,000 VND', expectedSalary: '40,000,000 VND', industry: 'E-commerce' },
  { id: '3',  name: 'Le Van C',     pic: 'Le Thi Hoa',      source: 'TopCV',         company: 'VNG Corporation', sGrade: 'A-', phone: '+84923456789', email: 'levanc@gmail.com',      currentRequests: ['26_DES_0001'], blacklist: false, currentStage: 'Interview 1',         lastUpdated: '2026-05-14', result: 'In Progress',    currentSalary: '20,000,000 VND', expectedSalary: '28,000,000 VND', industry: 'Technology' },
  { id: '4',  name: 'Pham Thi D',   pic: 'Pham Minh Tuan',  source: 'LinkedIn',      company: 'Momo',            sGrade: 'B', phone: '+84934567890', email: 'phamthid@gmail.com',    currentRequests: ['26_DAT_0001'], blacklist: false, currentStage: 'Onboard Status',      lastUpdated: '2026-04-20', result: 'Onboarded',     currentSalary: '22,000,000 VND', expectedSalary: '30,000,000 VND', industry: 'Fintech' },
  { id: '5',  name: 'Hoang Van E',  pic: 'Nguyen Thi Mai',  source: 'CareerBuilder', company: 'Tiki',            sGrade: 'C+', phone: '+84945678901', email: 'hoangvane@gmail.com',   currentRequests: ['26_ENG_0002'], blacklist: false, currentStage: 'HR Screening',        lastUpdated: '2026-05-15', result: 'In Progress',    currentSalary: '18,000,000 VND', expectedSalary: '25,000,000 VND', industry: 'E-commerce' },
  { id: '6',  name: 'Vo Thi F',     pic: 'Tran Van Duc',    source: 'Referral',      company: 'Viettel',         sGrade: 'A', phone: '+84956789012', email: 'vothif@gmail.com',      currentRequests: ['26_OPS_0001'], blacklist: false, currentStage: 'Interview 3',         lastUpdated: '2026-05-08', result: 'In Progress',    currentSalary: '35,000,000 VND', expectedSalary: '45,000,000 VND', industry: 'Telecom' },
  { id: '9',  name: 'Ngo Van I',    pic: 'Nguyen Thi Mai',  source: 'CareerBuilder', company: 'Lazada Vietnam',  sGrade: 'B', phone: '+84989012345', email: 'ngovani@gmail.com',     currentRequests: ['26_PRO_0001'], blacklist: true,  blacklistReason: 'Unprofessional conduct during interview', currentStage: 'Successfully Approached', lastUpdated: '2026-03-20', result: 'Closed', currentSalary: '24,000,000 VND', expectedSalary: '32,000,000 VND', industry: 'E-commerce' },
]

export const mockActivityLogs: ActivityLogEntry[] = [
  { id: '1',  date: '2026-05-16', user: 'Nguyen Thi Mai',  action: 'Stage Update',    detail: 'Moved Truong Van L: Applied → Successfully Approached for 26_ENG_0003' },
  { id: '2',  date: '2026-05-15', user: 'Le Thi Hoa',      action: 'Stage Update',    detail: 'Moved Hoang Van E: Submitted CV → HR Screening for 26_ENG_0002' },
  { id: '3',  date: '2026-05-14', user: 'Le Thi Hoa',      action: 'Candidate Added', detail: 'Matched Le Van C to request 26_DES_0001' },
  { id: '4',  date: '2026-05-13', user: 'Pham Minh Tuan',  action: 'Offer Sent',      detail: 'Sent Offer to Candidate: Dang Thi H for 26_MKT_0001' },
  { id: '5',  date: '2026-05-12', user: 'Nguyen Thi Mai',  action: 'Stage Update',    detail: 'Moved Nguyen Van A: Interview 1 → Interview 2 for 26_ENG_0001' },
]
