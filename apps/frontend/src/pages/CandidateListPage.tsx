import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate } from 'react-router-dom'
import { Search, Eye, Ban, UserPlus, Download, Trash2, Tag, X, RefreshCw, AlertCircle, FileText, Link2, Loader2, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { authService, candidateService, requestService, pipelineService } from "@/lib/services"
import type { AuthUser, CandidateListItem, RequestListItem } from "@/types/api"
import { cn } from "@/lib/utils"
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// ─── Loading skeleton ──────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-4" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-36" /></TableCell>
          <TableCell><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

// department is typed string but the list endpoint returns { name: string } at runtime
function asStrName(v: string): string {
  return (v as unknown as { name?: string })?.name ?? v
}

// ─── Multi-select filter dropdown ──────────────────────────────────────────
function MultiSelectFilter({
  label, options, selected, onToggle, onSelectAll, onClear,
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (v: string) => void
  onSelectAll: () => void
  onClear: () => void
}) {
  const buttonLabel = selected.length > 0 ? `${label} (${selected.length})` : label
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline" size="sm"
          className={cn(
            "h-8 w-44 justify-between text-xs font-normal",
            selected.length > 0 && "border-primary/50 text-primary"
          )}
        >
          {buttonLabel}
          <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-48" align="start">
        <div className="flex border-b border-border">
          <button type="button" className="flex-1 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={onSelectAll}>
            Select all
          </button>
          <button type="button" className="flex-1 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={onClear}>
            Clear
          </button>
        </div>
        <div className="max-h-48 overflow-y-auto py-1">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted cursor-pointer">
              <Checkbox checked={selected.includes(opt)} onCheckedChange={() => onToggle(opt)} />
              {opt}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function deriveStage(reqs: { overallStatus: string | null }[] | undefined): { label: string; color: string } {
  if (!reqs || reqs.length === 0) return { label: 'Opening', color: 'text-gray-500' }
  const statuses = reqs.map((r) => r.overallStatus)
  if (statuses.includes('Onboarded')) return { label: 'Onboarded', color: 'text-green-600' }
  if (statuses.includes('Offer')) return { label: 'Waiting Onboard', color: 'text-blue-600' }
  if (statuses.some((s) => s === 'In Progress' || s === 'On Hold')) return { label: 'Processing', color: 'text-orange-500' }
  return { label: 'Opening', color: 'text-gray-500' }
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

export default function CandidateListPage() {
  const navigate = useNavigate()
  // ── Raw data from API ──
  const [allCandidates, setAllCandidates] = useState<CandidateListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cvLoading, setCvLoading] = useState<string | null>(null)
  const [hrbpUsers, setHrbpUsers] = useState<AuthUser[]>([])
  const [cvSources, setCvSources] = useState<Array<{ id: string; name: string }>>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  // ── Filters ──
  const [search, setSearch] = useState("")
  const [selectedPics, setSelectedPics] = useState<string[]>([])
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [blacklistFilter, setBlacklistFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignRequestId, setAssignRequestId] = useState('')
  const [assignProgress, setAssignProgress] = useState<{ done: number; failed: number; total: number } | null>(null)
  const [requestsForPicker, setRequestsForPicker] = useState<RequestListItem[]>([])
  const [pickerSearch, setPickerSearch] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)

  const isAdmin = (() => {
    try { return (JSON.parse(localStorage.getItem('ghn_user') ?? '') as { role?: string })?.role === 'admin' }
    catch { return false }
  })()

  // ── Load all candidates once ──
  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await candidateService.list({
        limit,
        page,
        search: search || undefined,
        isBlacklisted:
          blacklistFilter === "yes" ? true :
          blacklistFilter === "no" ? false :
          undefined,
      })
      setAllCandidates(res.data ?? [])
      setTotal(res.total)
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không thể tải danh sách ứng viên")
    } finally {
      setLoading(false)
    }
  }, [blacklistFilter, page, search])

  useEffect(() => { fetchCandidates() }, [fetchCandidates])

  useEffect(() => {
    authService.listUsers()
      .then((users) => setHrbpUsers(users.filter((u) => u.isActive !== false)))
      .catch(() => {})

    candidateService.getCvSources()
      .then(setCvSources)
      .catch(() => {})
  }, [])

  // ── Derive filter options from backend lookup data ──
  const picOptions = hrbpUsers.map((u) => u.fullName)
  const sourceOptions = cvSources.map((s) => s.name)
  const candidates = allCandidates.filter((c) => {
    if (selectedPics.length > 0 && !selectedPics.includes(c.pic?.fullName ?? '')) return false
    if (selectedSources.length > 0 && !selectedSources.includes(c.cvSource?.name ?? '')) return false
    return true
  })

  const hasFilters = selectedPics.length > 0 || selectedSources.length > 0 || blacklistFilter !== "all" || search
  const allSelected = candidates.length > 0 && candidates.every((c) => selectedIds.has(c.id))
  const someSelected = selectedIds.size > 0
  const filteredRequests = requestsForPicker.filter((r) => {
    const q = pickerSearch.toLowerCase()
    return !q || r.requestNo.toLowerCase().includes(q) || (r.jobTitle?.title ?? '').toLowerCase().includes(q)
  })

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(candidates.map((c) => c.id)))
  }

  function toggleOne(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  function clearFilters() {
    setSearch("")
    setSelectedPics([])
    setSelectedSources([])
    setBlacklistFilter("all")
  }

  function togglePic(name: string) {
    setSelectedPics((prev) => prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name])
  }

  function toggleSource(name: string) {
    setSelectedSources((prev) => prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name])
  }

  async function handleOpenAssign() {
    setAssignOpen(true)
    setAssignRequestId('')
    setAssignProgress(null)
    setPickerSearch('')
    setRequestsForPicker([])
    try {
      const res = await requestService.list({ status: 'Opening', limit: 100 })
      setRequestsForPicker(res.data)
    } catch {
      setRequestsForPicker([])
    }
  }

  function handleExport(format: 'csv' | 'xlsx') {
    const subset = selectedIds.size > 0
      ? candidates.filter((c) => selectedIds.has(c.id))
      : candidates
    const rows = subset.map((c) => ({
      'Name': c.fullName,
      'Modified User': c.pic?.fullName ?? '',
      'Source': c.cvSource?.name ?? '',
      'Company': c.currentCompany ?? '',
      'S-Grade': c.sGrade ?? '',
      'Phone': c.phone ?? '',
      'Email': c.email ?? '',
      'Blacklist': c.isBlacklisted ? 'Yes' : 'No',
      'Update Date': fmtDate(c.updatedAt),
    }))
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const filename = `candidates_${dateStr}`

    if (format === 'csv') {
      const headers = ['Name', 'Modified User', 'Source', 'Company', 'S-Grade', 'Phone', 'Email', 'Blacklist', 'Update Date']
      const lines = [
        headers.join(','),
        ...rows.map((row) =>
          headers.map((h) => {
            const val = String((row as Record<string, string>)[h] ?? '')
            return val.includes(',') || val.includes('"') || val.includes('\n')
              ? `"${val.replace(/"/g, '""')}"`
              : val
          }).join(',')
        ),
      ]
      const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Candidates')
      XLSX.writeFile(wb, `${filename}.xlsx`)
    }
    setExportOpen(false)
  }

  async function handleConfirmArchive() {
    const ids = Array.from(selectedIds)
    let done = 0
    let failed = 0
    for (const id of ids) {
      try {
        await candidateService.archive(id)
        done++
      } catch {
        failed++
      }
    }
    toast.success(`Archived ${done}/${ids.length} candidates${failed > 0 ? ` (${failed} failed)` : ''}`)
    setSelectedIds(new Set())
    setArchiveOpen(false)
    fetchCandidates()
  }

  async function handleConfirmAssign() {
    if (!assignRequestId) return
    const ids = Array.from(selectedIds)
    const total = ids.length
    let done = 0
    let failed = 0
    setAssignProgress({ done: 0, failed: 0, total })
    for (const candidateId of ids) {
      try {
        await pipelineService.match({ candidateId, requestId: assignRequestId })
        done++
      } catch {
        failed++
      }
      setAssignProgress({ done, failed, total })
    }
    toast.success(`Matched ${done}/${total} candidates${failed > 0 ? ` (${failed} failed)` : ''}`)
    setSelectedIds(new Set())
    fetchCandidates()
    setAssignOpen(false)
    setAssignRequestId('')
    setAssignProgress(null)
    setPickerSearch('')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Candidate Pool</h1>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Đang tải..."
              : `${candidates.length}${candidates.length !== allCandidates.length ? ` / ${allCandidates.length}` : ""} candidates`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm" className="h-8 w-8 p-0"
            onClick={fetchCandidates} disabled={loading}
          >
            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
          </Button>
          <Link to="/candidates/new">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full lg:w-auto">
              <UserPlus className="h-4 w-4" />
              Add Candidate
            </Button>
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs" onClick={fetchCandidates}>
            Thử lại
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-white flex flex-wrap items-center gap-2 py-3 border-b border-slate-100">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm tên, email, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>

        {/* Modified User multi-select */}
        <MultiSelectFilter
          label="Modified User"
          options={picOptions}
          selected={selectedPics}
          onToggle={togglePic}
          onSelectAll={() => setSelectedPics(picOptions)}
          onClear={() => setSelectedPics([])}
        />

        {/* Source multi-select */}
        <MultiSelectFilter
          label="Source"
          options={sourceOptions}
          selected={selectedSources}
          onToggle={toggleSource}
          onSelectAll={() => setSelectedSources(sourceOptions)}
          onClear={() => setSelectedSources([])}
        />

        {/* Blacklist filter */}
        <Select value={blacklistFilter} onValueChange={setBlacklistFilter}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="no">Active</SelectItem>
            <SelectItem value="yes">Blacklisted</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {hasFilters && (
          <Button
            variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground"
            onClick={clearFilters}
          >
            <X className="h-3 w-3" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-[10px] border border-slate-200">
        <Table className="w-full min-w-[1200px] table-auto">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Name</TableHead>
              <TableHead className="hidden xl:table-cell text-xs font-semibold text-muted-foreground">Modified User</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Source</TableHead>
              <TableHead className="hidden xl:table-cell text-xs font-semibold text-muted-foreground">Company</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-center">S-Grade</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Phone</TableHead>
              <TableHead className="hidden xl:table-cell text-xs font-semibold text-muted-foreground">Email</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Stage</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-center">Blacklist</TableHead>
              <TableHead className="hidden xl:table-cell text-xs font-semibold text-muted-foreground text-center">Update Date</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-center w-10">CV</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton />
            ) : candidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center text-sm text-muted-foreground py-12">
                  {hasFilters
                    ? <>Không tìm thấy ứng viên phù hợp. <button className="text-primary underline ml-1" onClick={clearFilters}>Xóa bộ lọc</button></>
                    : "Chưa có ứng viên nào."}
                </TableCell>
              </TableRow>
            ) : (
              candidates.map((c) => {
                const isSelected = selectedIds.has(c.id)
                const picName = c.pic?.fullName ?? "—"
                const sourceName = (c.cvSource as any)?.name ?? "—"
                const company = c.currentCompany ?? "—"
                const sGrade = c.sGrade ?? null

                return (
                  <TableRow
                    key={c.id}
                    className={cn(
                      "group",
                      c.isBlacklisted && "bg-destructive/5",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(c.id)}
                        aria-label={`Select ${c.fullName}`}
                      />
                    </TableCell>

                    {/* Name */}
                    <TableCell>
                      <Link
                        to={`/candidates/${c.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {c.fullName}
                      </Link>
                    </TableCell>

                    {/* PIC */}
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">{picName}</TableCell>

                    {/* Source */}
                    <TableCell className="text-sm text-muted-foreground max-w-[140px] truncate">{sourceName}</TableCell>

                    {/* Company */}
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground max-w-[140px] truncate">{company}</TableCell>

                    {/* S-Grade */}
                    <TableCell className="text-center">
                      {sGrade
                        ? <Badge variant="outline" className="text-[11px] font-medium">{sGrade}</Badge>
                        : <span className="text-[11px] text-muted-foreground">—</span>
                      }
                    </TableCell>

                    <TableCell className="text-xs font-mono text-muted-foreground">{c.phone ?? '—'}</TableCell>

                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground max-w-[180px] truncate">{c.email ?? '—'}</TableCell>

                    {/* Stage */}
                    <TableCell className="text-xs font-medium whitespace-nowrap">
                      {(() => { const { label, color } = deriveStage(c.candidateRequests); return <span className={color}>{label}</span> })()}
                    </TableCell>

                    {/* Blacklist */}
                    <TableCell className="text-center">
                      {c.isBlacklisted
                        ? <Badge className="bg-destructive text-destructive-foreground text-[10px] border-0"><Ban className="h-3 w-3 mr-0.5" />Yes</Badge>
                        : <span className="text-[11px] text-muted-foreground">-</span>
                      }
                    </TableCell>

                    {/* Cập nhật */}
                    <TableCell className="hidden xl:table-cell text-center text-xs text-muted-foreground">{fmtDate(c.updatedAt)}</TableCell>

                    {/* CV icon */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {c.cvs && c.cvs.length > 0 && (
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 w-7 p-0"
                            title="Open uploaded CV"
                            disabled={cvLoading === c.id}
                            onClick={async () => {
                              setCvLoading(c.id)
                              try {
                                const url = await candidateService.getCvSignedUrl(c.id, c.cvs![0].id)
                                window.open(url, '_blank')
                              } finally {
                                setCvLoading(null)
                              }
                            }}
                          >
                            {cvLoading === c.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <FileText className="h-3.5 w-3.5 text-orange-500" />}
                          </Button>
                        )}
                        {c.cvLink && (
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 w-7 p-0"
                            title="Open CV Link"
                            onClick={() => window.open(c.cvLink!, '_blank')}
                          >
                            <Link2 className="h-3.5 w-3.5 text-blue-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>

                    {/* View */}
                    <TableCell>
                      <Link to={`/candidates/${c.id}`}>
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bulk Action Bar */}
      {someSelected && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 shadow-lg">
          <span className="text-sm font-medium text-foreground">{selectedIds.size} đã chọn</span>
          <div className="h-4 w-px bg-border" />
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={handleOpenAssign}><Tag className="h-3 w-3" />Assign Request</Button>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setExportOpen(true)}><Download className="h-3 w-3" />Export</Button>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive"><Ban className="h-3 w-3" />Blacklist</Button>
          {isAdmin && (
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive" onClick={() => setArchiveOpen(true)}><Trash2 className="h-3 w-3" />Xóa</Button>
          )}
          <div className="h-4 w-px bg-border" />
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={() => setSelectedIds(new Set())}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <Dialog open={assignOpen} onOpenChange={(open) => { if (!assignProgress) setAssignOpen(open) }}>
        <DialogContent className="sm:max-w-md" showCloseButton={!assignProgress}>
          <DialogHeader>
            <DialogTitle>Assign to Request</DialogTitle>
            <DialogDescription>
              Assign {selectedIds.size} candidate{selectedIds.size !== 1 ? 's' : ''} to:
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by request no. or job title..."
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              className="pl-9 h-8 text-sm"
              disabled={!!assignProgress}
            />
          </div>

          <div className="max-h-64 overflow-y-auto rounded-md border border-border">
            {filteredRequests.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {requestsForPicker.length === 0 ? 'No open requests found.' : 'No matches.'}
              </p>
            ) : (
              filteredRequests.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-sm border-b border-border last:border-0 hover:bg-muted transition-colors",
                    assignRequestId === r.id && "bg-primary/10 font-medium"
                  )}
                  onClick={() => setAssignRequestId(r.id)}
                  disabled={!!assignProgress}
                >
                  <span className="font-mono text-xs text-muted-foreground mr-2">{r.requestNo}</span>
                  <span className="text-foreground">{r.jobTitle?.title ?? '—'}</span>
                  <span className="ml-1 text-xs text-muted-foreground">· {asStrName(r.department)}</span>
                </button>
              ))
            )}
          </div>

          {assignProgress && (
            <p className="text-sm text-muted-foreground text-center">
              Matching {assignProgress.done + assignProgress.failed}/{assignProgress.total}...
              {assignProgress.failed > 0 && (
                <span className="text-destructive ml-1">({assignProgress.failed} failed)</span>
              )}
            </p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignOpen(false)}
              disabled={!!assignProgress}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAssign}
              disabled={!assignRequestId || !!assignProgress}
            >
              {assignProgress
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Matching...</>
                : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Archive Candidates</DialogTitle>
            <DialogDescription>
              Archive {selectedIds.size} candidate{selectedIds.size !== 1 ? 's' : ''}? They can be restored later from the candidate profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmArchive}>Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Export Candidates</DialogTitle>
            <DialogDescription>
              {selectedIds.size > 0
                ? `Export ${selectedIds.size} selected candidate${selectedIds.size !== 1 ? 's' : ''}`
                : `Export all ${candidates.length} visible candidates`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="justify-start gap-2" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => handleExport('xlsx')}>
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
