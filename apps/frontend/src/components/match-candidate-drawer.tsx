import { useState, useEffect } from "react"
import { Link } from 'react-router-dom'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertCircle,
  Briefcase,
  Building2,
  GraduationCap,
  LinkIcon,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react"
import type { CandidateListItem } from "@/types/api"
import { candidateService, pipelineService } from "@/lib/services"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Candidate Card                                                     */
/* ------------------------------------------------------------------ */

function CandidateMatchCard({
  candidate,
  onMatch,
  matched,
  matching,
}: {
  candidate: CandidateListItem
  onMatch: (id: string) => void
  matched: boolean
  /** True while this specific candidate's match API call is in-flight */
  matching: boolean
}) {
  const initials = candidate.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(-2)
    .join("")
    .toUpperCase()

  return (
    <div className={cn(
      "rounded-lg border p-3.5 transition-all",
      matched
        ? "border-success/40 bg-success/5"
        : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
    )}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="size-9 mt-0.5">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between">
            <Link
              to={`/candidates/${candidate.id}`}
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate"
            >
              {candidate.fullName}
            </Link>
            {candidate.sGrade && (
              <Badge variant="outline" className="text-[10px] font-mono shrink-0 ml-2">
                {candidate.sGrade}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{candidate.currentCompany ?? "—"}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Briefcase className="h-3 w-3 shrink-0" />
            <span className="truncate">{candidate.industry ?? "—"}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            {candidate.cvSource && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                {candidate.cvSource.name}
              </Badge>
            )}
            {candidate.isBlacklisted && (
              <Badge className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0 border-0 font-normal">
                Blacklisted
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-border/50">
        <Link to={`/candidates/${candidate.id}`}>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
            View Profile
          </Button>
        </Link>
        {matched ? (
          <Button
            size="sm"
            className="h-7 text-xs bg-success text-success-foreground hover:bg-success/90 gap-1"
            disabled
          >
            <Sparkles className="h-3 w-3" />
            Matched
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-1 bg-background"
            onClick={() => onMatch(candidate.id)}
            disabled={candidate.isBlacklisted || matching}
          >
            {matching
              ? <Loader2 className="h-3 w-3 animate-spin" />
              : <LinkIcon className="h-3 w-3" />
            }
            {matching ? "Matching..." : "Match"}
          </Button>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  MatchCandidateDrawer                                               */
/* ------------------------------------------------------------------ */

export function MatchCandidateDrawer({
  open,
  onOpenChange,
  requestId,
  requestNo,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Request PK — passed to pipelineService.match as the target request */
  requestId: string
  requestNo: string
  /** Called after each successful match so the parent can refresh data */
  onSuccess: () => void
}) {
  // ── Candidate pool (loaded from API on open) ──
  const [candidates, setCandidates] = useState<CandidateListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // ── Match action state ──
  /** IDs matched successfully in this session — drives the "Matched" button state */
  const [matchedInSession, setMatchedInSession] = useState<Set<string>>(new Set())
  /** ID of the candidate whose Match button is currently submitting */
  const [matchingId, setMatchingId] = useState<string | null>(null)
  /** Error from the most recent failed match attempt */
  const [apiError, setApiError] = useState<string | null>(null)

  // ── Filters (client-side over the loaded pool) ──
  const [search, setSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [industryFilter, setIndustryFilter] = useState("all")

  // ── Load candidates when drawer opens ──
  useEffect(() => {
    if (!open) return

    let cancelled = false
    setLoading(true)
    setLoadError(null)

    candidateService
      .list({ limit: 100 })
      .then((res) => {
        if (!cancelled) setCandidates(res.data)
      })
      .catch((e: any) => {
        if (!cancelled) {
          setLoadError(
            e?.response?.data?.message || "Không thể tải danh sách ứng viên."
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [open])

  // Reset all local state when the drawer closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setCandidates([])
      setLoading(false)
      setLoadError(null)
      setMatchedInSession(new Set())
      setMatchingId(null)
      setApiError(null)
      setSearch("")
      setSourceFilter("all")
      setIndustryFilter("all")
    }
    onOpenChange(isOpen)
  }

  const handleMatch = async (candidateId: string) => {
    setMatchingId(candidateId)
    setApiError(null)
    try {
      await pipelineService.match({ candidateId, requestId })
      setMatchedInSession((prev) => new Set([...prev, candidateId]))
      // Notify parent so it can refresh the candidate list for the request
      onSuccess()
    } catch (e: any) {
      if (e?.response?.status === 409) {
        // Candidate already matched to this request (duplicate) — treat as success
        // so the UI shows "Matched" and the user isn't confused by an error.
        setMatchedInSession((prev) => new Set([...prev, candidateId]))
      } else {
        setApiError(
          e?.response?.data?.message ||
          "Không thể match ứng viên. Vui lòng thử lại."
        )
      }
    } finally {
      setMatchingId(null)
    }
  }

  // ── Derived filter option lists (from loaded candidates) ──
  const sources = [
    ...new Set(
      candidates
        .map((c) => c.cvSource?.name)
        .filter((s): s is string => Boolean(s))
    ),
  ]
  const industries = [
    ...new Set(
      candidates
        .map((c) => c.industry)
        .filter((i): i is string => Boolean(i))
    ),
  ]

  // ── Client-side filtering ──
  const filtered = candidates.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      (c.currentCompany ?? "").toLowerCase().includes(q) ||
      (c.industry ?? "").toLowerCase().includes(q)
    const matchSource =
      sourceFilter === "all" || c.cvSource?.name === sourceFilter
    const matchIndustry =
      industryFilter === "all" || c.industry === industryFilter
    return matchSearch && matchSource && matchIndustry
  })

  // Sort: matched-in-session last, blacklisted last among unmatched
  const sorted = [...filtered].sort((a, b) => {
    const aMatched = matchedInSession.has(a.id) ? 1 : 0
    const bMatched = matchedInSession.has(b.id) ? 1 : 0
    if (aMatched !== bMatched) return aMatched - bMatched
    if (a.isBlacklisted !== b.isBlacklisted) return a.isBlacklisted ? 1 : -1
    return 0
  })

  const hasFilters = search || sourceFilter !== "all" || industryFilter !== "all"

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-none sm:w-[440px] p-0 flex flex-col overflow-hidden"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
          <SheetTitle className="text-base">Match Candidate</SheetTitle>
          <SheetDescription className="text-xs">
            Find and match candidates to{" "}
            <span className="font-mono font-medium text-foreground">{requestNo}</span>
          </SheetDescription>
        </SheetHeader>

        {/* Search + Filters */}
        <div className="px-5 py-3 space-y-2.5 border-b border-border bg-muted/30">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, company, industry..."
              className="h-8 pl-8 text-xs focus-visible:ring-[#009BE0]/20"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="h-7 text-[11px] flex-1">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="h-7 text-[11px] flex-1">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              {loading
                ? "Đang tải..."
                : <>{sorted.length} candidates &middot;{" "}
                    <span className="text-success font-medium">
                      {matchedInSession.size} matched
                    </span>
                  </>
              }
            </p>
            {hasFilters && !loading && (
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setSourceFilter("all")
                  setIndustryFilter("all")
                }}
                className="text-[11px] text-primary hover:text-primary/80 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Match API Error */}
        {apiError && (
          <div className="mx-4 mt-2 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="size-3.5 shrink-0" />
            {apiError}
          </div>
        )}

        {/* Candidate Cards */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-2.5 p-4">
            {/* Initial load spinner */}
            {loading && (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Đang tải ứng viên...</p>
              </div>
            )}

            {/* Load failure */}
            {!loading && loadError && (
              <div className="flex flex-col items-center py-12 text-center">
                <AlertCircle className="h-6 w-6 text-destructive/60 mb-2" />
                <p className="text-sm text-muted-foreground">{loadError}</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && !loadError && sorted.length === 0 && (
              <div className="flex flex-col items-center py-12 text-center">
                <GraduationCap className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No candidates found</p>
                <p className="text-xs text-muted-foreground/60">Try adjusting your filters</p>
              </div>
            )}

            {/* Candidate list */}
            {!loading && !loadError && sorted.map((c) => (
              <CandidateMatchCard
                key={c.id}
                candidate={c}
                matched={matchedInSession.has(c.id)}
                matching={matchingId === c.id}
                onMatch={handleMatch}
              />
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
