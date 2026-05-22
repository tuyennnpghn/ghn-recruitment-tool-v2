import { useState, useEffect, useCallback } from "react"
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  LinkIcon, Trash2, ClipboardCheck,
  Loader2, AlertCircle,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { ShareRequestDrawer } from "@/components/share-request-drawer"
import { MatchCandidateDrawer } from "@/components/match-candidate-drawer"
import { UpdateResultDrawer, getResultBadgeColor } from "@/components/update-result-drawer"
import { RequestStatusSelect } from "@/components/request-status-select"
import { requestService, pipelineService } from "@/lib/services"
import { FunnelReportTab } from "@/components/funnel-report-tab"
import type { RequestDetail, RequestCandidateItem } from "@/types/api"
import { PIPELINE_STAGES } from "@/types/api"


function getStageColor(stage: string) {
  if (stage?.startsWith("Interview 1")) return "bg-[color:hsl(214,100%,50%)]/15 text-[color:hsl(214,100%,40%)]"
  if (stage?.startsWith("Interview 2")) return "bg-[color:hsl(214,100%,50%)]/25 text-[color:hsl(214,100%,40%)]"
  if (stage?.startsWith("Interview 3")) return "bg-[color:oklch(0.45_0.115_230.5)]/15 text-[color:oklch(0.45_0.115_230.5)]"
  if (stage === "Offer to Candidate") return "bg-[color:hsl(38,92%,50%)]/15 text-[color:hsl(38,70%,30%)]"
  if (stage === "Onboard Status") return "bg-[color:hsl(142,71%,45%)]/15 text-[color:hsl(142,71%,35%)]"
  return "bg-muted text-muted-foreground"
}

/**
 * Formats an ISO date string to DD/MM/YYYY for display.
 * Returns '—' for null, undefined, or unparseable dates.
 */
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

/**
 * Returns Tailwind badge classes for the Next Step column.
 * Color reflects the pipeline result type from the backend state machine:
 *   continue  = green  (candidate moves forward)
 *   waiting   = amber  (candidate waiting at current stage)
 *   terminal  = red    (pipeline closed — rejected/cancelled)
 *   completed = teal   (onboarded)
 */
function getStatusTypeBadgeColor(statusType: string | null | undefined): string {
  switch (statusType) {
    case 'continue':  return 'bg-success/15 text-success'
    case 'waiting':   return 'bg-warning/15 text-warning-foreground'
    case 'terminal':  return 'bg-destructive/15 text-destructive'
    case 'completed': return 'bg-emerald-50 text-emerald-800 border border-emerald-200'
    default:          return 'bg-muted text-muted-foreground'
  }
}

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()

  // ── Data loading ──
  const [requestData, setRequestData] = useState<RequestDetail | null>(null)
  const [candidateItems, setCandidateItems] = useState<RequestCandidateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'candidates' | 'funnel'>('candidates')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setLoadError(null)
    Promise.all([requestService.get(id), requestService.getCandidates(id)])
      .then(([req, cands]) => {
        setRequestData(req)
        setCandidateItems(cands)
      })
      .catch((e: any) => {
        setLoadError(e?.response?.data?.message || "Không thể tải dữ liệu. Vui lòng thử lại.")
      })
      .finally(() => setLoading(false))
  }, [id])

  // Refetch only the candidate list — called after match/unmatch/move-stage/update-result
  const refetchCandidates = useCallback(() => {
    if (!id) return
    requestService.getCandidates(id)
      .then(setCandidateItems)
      .catch((e: any) => console.error("Failed to refresh candidates:", e))
  }, [id])

  // ── Drawer state ──
  const [shareOpen, setShareOpen] = useState(false)
  const [matchOpen, setMatchOpen] = useState(false)
  const [updateResultOpen, setUpdateResultOpen] = useState(false)
  // Single selected CandidateRequest row — shared between MoveStage and UpdateResult drawers
  const [selectedCR, setSelectedCR] = useState<RequestCandidateItem | null>(null)
  // Tracks which row's unmatch is in-flight for per-row loading state
  const [unmatchingId, setUnmatchingId] = useState<string | null>(null)

  const openUpdateResultDrawer = (item: RequestCandidateItem) => {
    setSelectedCR(item)
    setUpdateResultOpen(true)
  }

  const handleUnmatch = async (item: RequestCandidateItem) => {
    if (!window.confirm(`Remove ${item.candidate.fullName} from this request?\nThis action cannot be undone — the candidate cannot be re-added to the same request.`)) return
    setUnmatchingId(item.id)
    try {
      await pipelineService.unmatch(item.id)
      refetchCandidates()
    } catch (e: any) {
      alert(e?.response?.data?.message || "Không thể unmatch ứng viên.")
    } finally {
      setUnmatchingId(null)
    }
  }

  // ── Loading / error / not-found guards ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <AlertCircle className="h-6 w-6 text-destructive/60" />
        <p className="text-sm text-muted-foreground">{loadError}</p>
      </div>
    )
  }

  if (!requestData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Request not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Link to="/requests">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-foreground">{requestData.requestNo}</h1>
            <RequestStatusSelect
              value={requestData.status}
              onChange={() => {}}
              size="md"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {requestData.jobTitle?.title ?? "—"} &middot; {requestData.department.name} &middot; {requestData.recruiter.fullName}
          </p>
          {requestData.shared.length > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-muted-foreground">Shared with:</span>
              <div className="flex -space-x-1.5">
                {requestData.shared.slice(0, 3).map((h, i) => {
                  const initials = h.fullName.split(" ").map((n) => n[0]).slice(-2).join("").toUpperCase()
                  return (
                    <Avatar key={h.userId} className="size-5 border border-background">
                      <AvatarFallback className={`text-[8px] font-semibold ${
                        i === 0 ? "bg-primary text-primary-foreground" :
                        i === 1 ? "bg-[color:oklch(0.45_0.115_230.5)] text-white" :
                        "bg-[color:hsl(38,92%,50%)] text-white"
                      }`}>{initials}</AvatarFallback>
                    </Avatar>
                  )
                })}
              </div>
              <span className="text-xs text-muted-foreground">
                {requestData.shared.slice(0, 3).map((h) => h.fullName).join(" • ")}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setShareOpen(true)}>
            <Users className="h-3.5 w-3.5" />Share Request
          </Button>
          <Button
            size="sm"
            className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setMatchOpen(true)}
          >
            <LinkIcon className="h-3.5 w-3.5" />Match Candidate
          </Button>
        </div>
      </div>

      {/* Tabs — Candidates | Funnel Report */}
      <div>
        <div className="flex border-b border-border">
          <button
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'candidates'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('candidates')}
          >
            Candidates ({candidateItems.length})
          </button>
          <button
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'funnel'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('funnel')}
          >
            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
            Funnel Report
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'candidates' && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Candidates ({candidateItems.length})</h2>
              {/* overflow-x-auto allows the 8-column table to scroll on narrow screens */}
              <div className="w-full overflow-x-auto rounded-[10px] border border-slate-200">
                <Table className="w-full min-w-[900px] table-auto">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-semibold text-muted-foreground">Candidate</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">HRBP</TableHead>
                      <TableHead className="hidden xl:table-cell text-xs font-semibold text-muted-foreground whitespace-nowrap">Matching Date</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Current Step</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Current Status</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Next Step</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Update Process</TableHead>
                      <TableHead className="hidden xl:table-cell text-xs font-semibold text-muted-foreground whitespace-nowrap">Update Process Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidateItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                          No candidates yet. Click &ldquo;Match Candidate&rdquo; to add candidates.
                        </TableCell>
                      </TableRow>
                    ) : (
                      candidateItems.map((item) => {
                        const updateProcessDate = item.pipelineSteps.find(
                          (s) => s.stepNumber === item.latestCompletedStep
                        )?.stepDate ?? null

                        const isClosedPipeline =
                          item.statusType === 'terminal' || item.statusType === 'completed'

                        return (
                          <TableRow key={item.id} className="group">
                            <TableCell>
                              <Link
                                to={`/candidates/${item.candidateId}`}
                                className="text-sm font-medium text-primary hover:underline"
                              >
                                {item.candidate.fullName}
                              </Link>
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground">
                              {item.candidate.pic?.fullName ?? '—'}
                            </TableCell>

                            <TableCell className="hidden xl:table-cell text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(item.matchedAt)}
                            </TableCell>

                            <TableCell>
                              {item.latestCompletedStepName ? (
                                <Badge className={`${getStageColor(item.latestCompletedStepName)} text-[11px] border-0`}>
                                  {item.latestCompletedStepName}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>

                            <TableCell>
                              {item.latestResult ? (
                                <Badge className={`${getResultBadgeColor(item.latestResult)} text-[11px] border-0`}>
                                  {item.latestResult}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">No result yet</span>
                              )}
                            </TableCell>

                            <TableCell>
                              {item.nextStepName ? (
                                <Badge className={`${getStatusTypeBadgeColor(item.statusType)} text-[11px] border-0`}>
                                  {item.nextStepName}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {isClosedPipeline ? (
                                  <Link to={`/candidates/${item.candidateId}`}>
                                    <Button size="sm" variant="ghost" className="h-7 text-xs">
                                      View
                                    </Button>
                                  </Link>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs gap-1"
                                    onClick={() => openUpdateResultDrawer(item)}
                                  >
                                    <ClipboardCheck className="h-3 w-3" />Update
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={unmatchingId === item.id}
                                  title="Remove Matching"
                                  aria-label="Remove Matching"
                                  onClick={() => handleUnmatch(item)}
                                >
                                  {unmatchingId === item.id
                                    ? <Loader2 className="h-3 w-3 animate-spin" />
                                    : <Trash2 className="h-3 w-3" />
                                  }
                                </Button>
                              </div>
                            </TableCell>

                            <TableCell className="hidden xl:table-cell text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(updateProcessDate)}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === 'funnel' && (
            <FunnelReportTab requestId={id!} />
          )}
        </div>
      </div>

      {/* Drawers */}
      <ShareRequestDrawer
        open={shareOpen}
        onOpenChange={setShareOpen}
        requestNo={requestData.requestNo}
        existingShares={requestData.shared.map(h => ({
          name: h.fullName,
          // Derive display initials from fullName (last two words)
          initials: h.fullName.split(" ").map((n) => n[0]).slice(-2).join("").toUpperCase(),
          sharedDate: h.sharedDate,
        }))}
      />
      <MatchCandidateDrawer
        open={matchOpen}
        onOpenChange={setMatchOpen}
        requestId={requestData.id}
        requestNo={requestData.requestNo}
        onSuccess={refetchCandidates}
      />


      {/* UpdateResultDrawer — conditional render ensures candidateRequestId is never empty */}
      {selectedCR && (
        <UpdateResultDrawer
          open={updateResultOpen}
          onOpenChange={(isOpen) => {
            setUpdateResultOpen(isOpen)
            if (!isOpen) setSelectedCR(null)
          }}
          candidateRequestId={selectedCR.id}
          candidateName={selectedCR.candidate.fullName}
          currentStage={PIPELINE_STAGES[selectedCR.currentStep - 1]}
          stepNumber={selectedCR.currentStep}
          currentResult={
            selectedCR.pipelineSteps.find(s => s.stepNumber === selectedCR.currentStep)?.stepResult ?? null
          }
          onSuccess={refetchCandidates}
        />
      )}
    </div>
  )
}
