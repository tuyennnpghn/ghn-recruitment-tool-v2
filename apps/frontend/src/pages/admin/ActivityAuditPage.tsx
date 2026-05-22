import { useState, useEffect, useCallback } from "react"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { adminService } from "@/lib/services"
import { toast } from "sonner"

// ─── Types ───────────────────────────────────────────────────────────────────

interface LogUser { id: string; fullName: string; email: string }

interface ActivityEntry {
  id: string
  entityType: string
  entityId: string
  action: string
  changesJson: Record<string, { from: unknown; to: unknown }> | null
  createdAt: string
  user: LogUser
}

interface PagedResult {
  data: ActivityEntry[]
  total: number
  page: number
  limit: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ENTITY_TYPES = ["Request", "Candidate", "CandidateRequest", "PipelineStep"]
const ACTIONS      = ["CREATE", "UPDATE", "DELETE", "ARCHIVE", "RESTORE"]
const LIMIT        = 50

const ACTION_COLORS: Record<string, string> = {
  CREATE:  "bg-emerald-50 text-emerald-800 border border-emerald-200",
  UPDATE:  "bg-sky-50 text-[#006FAD] border border-sky-200",
  DELETE:  "bg-red-50 text-red-700 border border-red-200",
  ARCHIVE: "bg-amber-50 text-amber-800 border border-amber-200",
  RESTORE: "bg-violet-50 text-violet-700 border border-violet-200",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

function displayVal(v: unknown): string {
  if (v === null || v === undefined) return "∅"
  if (typeof v === "object") return JSON.stringify(v)
  return String(v)
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ActivityAuditPage() {
  const [result,  setResult]  = useState<PagedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [users,   setUsers]   = useState<LogUser[]>([])

  const [entityType, setEntityType] = useState("all")
  const [action,     setAction]     = useState("all")
  const [userId,     setUserId]     = useState("all")
  const [fromDate,   setFromDate]   = useState("")
  const [toDate,     setToDate]     = useState("")
  const [page,       setPage]       = useState(1)

  useEffect(() => {
    adminService.listUsers()
      .then((u) => setUsers(u as LogUser[]))
      .catch(() => {})
  }, [])

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminService.listActivityLogs({
        page,
        limit:      LIMIT,
        entityType: entityType !== "all" ? entityType : undefined,
        userId:     userId     !== "all" ? userId     : undefined,
        action:     action     !== "all" ? action     : undefined,
        from:       fromDate || undefined,
        to:         toDate   || undefined,
      })
      setResult(res as PagedResult)
    } catch {
      toast.error("Failed to load activity logs")
    } finally {
      setLoading(false)
    }
  }, [page, entityType, action, userId, fromDate, toDate])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  function clearFilters() {
    setEntityType("all"); setAction("all"); setUserId("all")
    setFromDate(""); setToDate(""); setPage(1)
  }

  const hasFilters = entityType !== "all" || action !== "all" ||
                     userId !== "all" || !!fromDate || !!toDate

  const totalPages = result ? Math.ceil(result.total / LIMIT) : 1

  function renderChanges(json: ActivityEntry["changesJson"]) {
    if (!json) return <span className="text-muted-foreground text-xs">—</span>
    const entries = Object.entries(json)
    if (entries.length === 0) return <span className="text-muted-foreground text-xs">—</span>
    return (
      <div className="space-y-0.5">
        {entries
          .filter(([, val]) => val !== null && val !== undefined)
          .map(([key, val]) => (
          <div key={key} className="text-xs leading-snug">
            <span className="font-medium text-foreground">{key}:</span>{" "}
            <span className="text-muted-foreground">{displayVal(val.from)}</span>
            <span className="mx-1 text-muted-foreground">→</span>
            <span className="text-foreground">{displayVal(val.to)}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Activity Audit</h1>
        <p className="text-sm text-muted-foreground">
          {result ? `${result.total.toLocaleString()} total events` : "Loading…"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={entityType} onValueChange={(v) => { setEntityType(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {ENTITY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={action} onValueChange={(v) => { setAction(v); setPage(1) }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {ACTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={userId} onValueChange={(v) => { setUserId(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          className="w-[150px]"
          value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setPage(1) }}
        />
        <Input
          type="date"
          className="w-[150px]"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setPage(1) }}
        />

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[110px]">Time</TableHead>
              <TableHead className="w-[160px]">User</TableHead>
              <TableHead className="w-[150px]">Type</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : !result || result.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No activity found
                </TableCell>
              </TableRow>
            ) : result.data.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTime(entry.createdAt)}
                </TableCell>
                <TableCell className="text-sm">{entry.user.fullName}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{entry.entityType}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${ACTION_COLORS[entry.action] ?? "bg-muted text-muted-foreground"}`}>
                    {entry.action}
                  </span>
                </TableCell>
                <TableCell>{renderChanges(entry.changesJson)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {result && result.total > LIMIT && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, result.total)} of{" "}
            {result.total.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />Prev
            </Button>
            <span>Page {page} of {totalPages}</span>
            <Button
              variant="outline" size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next<ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
