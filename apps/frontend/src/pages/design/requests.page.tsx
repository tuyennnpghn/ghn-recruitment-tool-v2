import { useState } from "react"
import { Link } from 'react-router-dom'
import { Search, Plus, Eye, Users, LinkIcon } from "lucide-react"
import { NewRequestDrawer } from "@/components/new-request-drawer"
import { ShareRequestDrawer } from "@/components/share-request-drawer"
import { MatchCandidateDrawer } from "@/components/match-candidate-drawer"
import { RequestStatusSelect } from "@/components/request-status-select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { mockRequests } from '@/lib/mock-data'
import type { RequestStatus, SharedHrbp, RecruitmentRequest } from '@/lib/mock-data'

function getLeadtimeColor(leadtime: number, standard: number) {
  return leadtime > standard ? "text-destructive font-bold" : "text-success"
}

const avatarColors = [
  "bg-primary text-primary-foreground",
  "bg-secondary text-secondary-foreground",
  "bg-chart-3 text-primary-foreground",
  "bg-chart-4 text-foreground",
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
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [deptFilter, setDeptFilter] = useState<string>("all")
  const [recruiterFilter, setRecruiterFilter] = useState<string>("all")
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Quick action drawers
  const [shareDrawerOpen, setShareDrawerOpen] = useState(false)
  const [matchDrawerOpen, setMatchDrawerOpen] = useState(false)
  const [activeRequest, setActiveRequest] = useState<RecruitmentRequest | null>(null)

  // Status overrides for inline editing
  const [statusOverrides, setStatusOverrides] = useState<Record<string, RequestStatus>>({})

  const getRequestStatus = (req: RecruitmentRequest) => statusOverrides[req.id] || req.status
  const handleStatusChange = (reqId: string, newStatus: RequestStatus) => {
    setStatusOverrides((prev) => ({ ...prev, [reqId]: newStatus }))
  }

  const departments = [...new Set(mockRequests.map((r) => r.department))]
  const recruiters = [...new Set(mockRequests.map((r) => r.recruiter))]

  const filtered = mockRequests.filter((r) => {
    const matchSearch =
      r.requestNo.toLowerCase().includes(search.toLowerCase()) ||
      r.position.toLowerCase().includes(search.toLowerCase())
    const currentStatus = getRequestStatus(r)
    const matchStatus = statusFilter === "all" || currentStatus === statusFilter
    const matchDept = deptFilter === "all" || r.department === deptFilter
    const matchRecruiter = recruiterFilter === "all" || r.recruiter === recruiterFilter
    return matchSearch && matchStatus && matchDept && matchRecruiter
  })

  const openShare = (req: RecruitmentRequest) => {
    setActiveRequest(req)
    setShareDrawerOpen(true)
  }

  const openMatch = (req: RecruitmentRequest) => {
    setActiveRequest(req)
    setMatchDrawerOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground text-balance">Request Management</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} recruitment requests</p>
        </div>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setDrawerOpen(true)}>
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Sticky Filters */}
      <div className="sticky top-0 z-10 flex items-center gap-3 rounded-lg border border-border bg-card p-3">
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
            <SelectItem value="Accepted Offer">Accepted Offer</SelectItem>
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
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-muted-foreground">Request No</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Position</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Department</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Recruiter</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Shared HRBP</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Open Date</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-center">Candidates</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-center">Leadtime</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-center">Offered</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-center">Onboarded</TableHead>
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
                <TableCell className="text-sm font-medium text-foreground max-w-40 truncate">{req.position}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{req.department}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{req.recruiter}</TableCell>
                <TableCell>
                  <SharedHrbpAvatars hrbps={req.sharedHrbps} />
                </TableCell>
                <TableCell>
                  <RequestStatusSelect
                    value={getRequestStatus(req)}
                    onChange={(newStatus) => handleStatusChange(req.id, newStatus)}
                    size="sm"
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{req.openDate}</TableCell>
                <TableCell className="text-center text-sm font-medium text-foreground">{req.candidateCount}</TableCell>
                <TableCell className="text-center">
                  {req.isConsultant ? (
                    <span className="text-sm text-muted-foreground">N/A</span>
                  ) : (
                    <span className={`text-sm font-medium ${getLeadtimeColor(req.leadtime, req.leadtimeStandard)}`}>
                      {req.leadtime}d {req.leadtime > req.leadtimeStandard ? "⚠️" : "✓"} / {req.leadtimeStandard}d
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center text-sm text-foreground">{req.offered}</TableCell>
                <TableCell className="text-center text-sm text-foreground">{req.onboarded}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => openShare(req)}
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span className="sr-only">Share Request</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">Share</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => openMatch(req)}
                        >
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
            existingShares={activeRequest.sharedHrbps}
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
  )
}
