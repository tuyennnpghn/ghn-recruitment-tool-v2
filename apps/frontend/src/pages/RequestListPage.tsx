import { useState, useEffect } from "react"
import { Link } from 'react-router-dom'
import { Search, Plus, Eye, Users, LinkIcon, Loader2, AlertCircle } from "lucide-react"
import { NewRequestDrawer } from "@/components/new-request-drawer"
import { ShareRequestDrawer } from "@/components/share-request-drawer"
import { MatchCandidateDrawer } from "@/components/match-candidate-drawer"
import { RequestStatusSelect } from "@/components/request-status-select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { requestService } from "@/lib/services"
import type { RequestListItem, RequestStatus } from "@/types/api"

interface SharedHrbp {
  name: string
  initials: string
  sharedDate: string
}

function asStr(v: unknown): string {
  if (typeof v === 'string') return v || '—'
  if (v !== null && typeof v === 'object') {
    const obj = v as Record<string, unknown>
    const val = obj.name ?? obj.title ?? obj.fullName
    return val != null ? String(val) : '—'
  }
  return '—'
}

function formatDateDDMMYYYY(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '—'
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

function toInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function buildHrbps(req: RequestListItem): SharedHrbp[] {
  const slots = [
    { user: req.shared1, date: req.shared1Date },
    { user: req.shared2, date: req.shared2Date },
    { user: req.shared3, date: req.shared3Date },
  ]
  const result: SharedHrbp[] = []
  for (const { user, date } of slots) {
    if (!user) continue
    result.push({
      name: user.fullName,
      initials: toInitials(user.fullName),
      sharedDate: date ? formatDateDDMMYYYY(date) : '',
    })
  }
  return result
}

const avatarColors = [
  "bg-primary text-primary-foreground",
  "bg-[#006FAD] text-white",
  "bg-amber-400 text-white",
  "bg-violet-500 text-white",
]

function getAvatarColor(index: number) {
  return avatarColors[index % avatarColors.length]
}

function SharedHrbpAvatars({ hrbps }: { hrbps: SharedHrbp[] }) {
  if (hrbps.length === 0) {
    return <span className="text-xs text-muted-foreground/50">&mdash;</span>
  }

  const visible = hrbps.slice(0, 3)
  const overflow = hrbps.length > 3 ? hrbps.length - 3 : 0

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center cursor-default">
          <div className="flex -space-x-2">
            {visible.map((h, i) => (
              <Avatar key={h.initials + i} className="size-7 border-2 border-card">
                <AvatarFallback className={`${getAvatarColor(i)} text-[10px] font-semibold`}>
                  {h.initials}
                </AvatarFallback>
              </Avatar>
            ))}
            {overflow > 0 && (
              <Avatar className="size-7 border-2 border-card">
                <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-medium">
                  +{overflow}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="bg-card text-card-foreground border border-border shadow-lg p-2.5 max-w-52">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Shared with</p>
        <div className="space-y-1.5">
          {hrbps.map((h, i) => (
            <div key={h.initials + i} className="flex items-center gap-2">
              <Avatar className="size-5">
                <AvatarFallback className={`${getAvatarColor(i)} text-[8px] font-semibold`}>
                  {h.initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-foreground">{h.name}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{h.sharedDate}</span>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

export default function RequestListPage() {
  const [requests, setRequests] = useState<RequestListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [deptFilter, setDeptFilter] = useState<string>("all")
  const [recruiterFilter, setRecruiterFilter] = useState<string>("all")
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [shareDrawerOpen, setShareDrawerOpen] = useState(false)
  const [matchDrawerOpen, setMatchDrawerOpen] = useState(false)
  const [activeRequest, setActiveRequest] = useState<RequestListItem | null>(null)

  const [statusOverrides, setStatusOverrides] = useState<Record<string, RequestStatus>>({})

  useEffect(() => {
    setIsLoading(true)
    setLoadError(null)
    requestService.list()
      .then((result) => setRequests(result.data))
      .catch(() => setLoadError('Unable to load requests'))
      .finally(() => setIsLoading(false))
  }, [])

  const getRequestStatus = (req: RequestListItem) => statusOverrides[req.id] ?? req.status
  const handleStatusChange = (reqId: string, newStatus: RequestStatus) => {
    setStatusOverrides((prev) => ({ ...prev, [reqId]: newStatus }))
  }

  const departments = [...new Set(requests.map((r) => asStr(r.department)))]
  const recruiters = [...new Set(requests.map((r) => asStr(r.recruiter)))]

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.requestNo.toLowerCase().includes(search.toLowerCase()) ||
      (r.jobTitle?.title ?? '').toLowerCase().includes(search.toLowerCase())
    const currentStatus = getRequestStatus(r)
    const matchStatus = statusFilter === "all" || currentStatus === statusFilter
    const matchDept = deptFilter === "all" || asStr(r.department) === deptFilter
    const matchRecruiter = recruiterFilter === "all" || asStr(r.recruiter) === recruiterFilter
    return matchSearch && matchStatus && matchDept && matchRecruiter
  })

  const openShare = (req: RequestListItem) => {
    setActiveRequest(req)
    setShareDrawerOpen(true)
  }

  const openMatch = (req: RequestListItem) => {
    setActiveRequest(req)
    setMatchDrawerOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading requests...</span>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-32 gap-2">
        <AlertCircle className="h-4 w-4 text-destructive/60" />
        <span className="text-sm text-muted-foreground">{loadError}</span>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Request Management</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} recruitment requests</p>
          </div>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full lg:w-auto" onClick={() => setDrawerOpen(true)}>
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </div>

        {/* Filters */}
        <div className="sticky top-0 z-10 bg-white flex flex-wrap items-center gap-2 py-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search request or position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Opening">Opening</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Accepted offer">Accepted Offer</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
              <SelectItem value="Close">Close</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={recruiterFilter} onValueChange={setRecruiterFilter}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue placeholder="Recruiter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Recruiters</SelectItem>
              {recruiters.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(statusFilter !== "all" || deptFilter !== "all" || recruiterFilter !== "all" || search) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={() => {
                setSearch("")
                setStatusFilter("all")
                setDeptFilter("all")
                setRecruiterFilter("all")
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto rounded-[10px] border border-slate-200">
          <Table className="w-full min-w-[1100px] table-auto">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground">Request No</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Position</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Department</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Recruiter</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Shared HRBP</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="hidden xl:table-cell text-xs font-semibold text-muted-foreground">Open Date</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-center">Candidates</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-center">Leadtime</TableHead>
                <TableHead className="hidden xl:table-cell text-xs font-semibold text-muted-foreground text-center">Offered</TableHead>
                <TableHead className="hidden xl:table-cell text-xs font-semibold text-muted-foreground text-center">Onboarded</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right">Quick Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((req) => (
                <TableRow key={req.id} className="group">
                  <TableCell>
                    <Link to={`/requests/${req.id}`} className="text-sm font-medium text-primary hover:underline">
                      {req.requestNo}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground max-w-40 truncate">{req.jobTitle?.title ?? '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{asStr(req.department)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{asStr(req.recruiter)}</TableCell>
                  <TableCell>
                    <SharedHrbpAvatars hrbps={buildHrbps(req)} />
                  </TableCell>
                  <TableCell>
                    <RequestStatusSelect
                      value={getRequestStatus(req)}
                      onChange={(newStatus) => handleStatusChange(req.id, newStatus)}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">{formatDateDDMMYYYY(req.openDate)}</TableCell>
                  <TableCell className="text-center text-sm font-medium text-foreground">{req._count.candidateRequests}</TableCell>
                  <TableCell className="text-center">
                    {req.isConsultant || req.actualLeadTimeDays === null
                      ? <span className="text-sm text-muted-foreground">N/A</span>
                      : <span className={`text-sm font-medium ${req.leadTimeStatus === 'Over leadtime' ? 'text-destructive font-bold' : 'text-[color:hsl(142,71%,45%)]'}`}>
                          {req.actualLeadTimeDays}d {req.leadTimeStatus === 'Over leadtime' ? '⚠️' : '✓'}
                        </span>
                    }
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-center text-sm text-foreground">{req.offeredCount}</TableCell>
                  <TableCell className="hidden xl:table-cell text-center text-sm text-foreground">{req.onboardedCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openShare(req)}>
                            <Users className="h-3.5 w-3.5" />
                            <span className="sr-only">Share Request</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Share</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openMatch(req)}>
                            <LinkIcon className="h-3.5 w-3.5" />
                            <span className="sr-only">Match Candidate</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Match</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link to={`/requests/${req.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Eye className="h-3.5 w-3.5" />
                              <span className="sr-only">View Request</span>
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">View</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Drawers */}
        <NewRequestDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

        {activeRequest && (
          <>
            <ShareRequestDrawer
              open={shareDrawerOpen}
              onOpenChange={setShareDrawerOpen}
              requestNo={activeRequest.requestNo}
              existingShares={[]}
            />
            <MatchCandidateDrawer
              open={matchDrawerOpen}
              onOpenChange={setMatchDrawerOpen}
              requestId={activeRequest.id}
              requestNo={activeRequest.requestNo}
              onSuccess={() => {}}
            />
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
