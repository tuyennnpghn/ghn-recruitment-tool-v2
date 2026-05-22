import { useState } from "react"
import { Check, AlertCircle, Clock, CheckCircle2, XCircle, Ban } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { STAGE_RESULT_OPTIONS } from "@/types/api"
import type { CandidateStage } from "@/types/api"
import { pipelineService } from "@/lib/services"

/* ------------------------------------------------------------------ */
/*  Result classification helpers                                      */
/*  These determine the colour/icon shown for each result option.     */
/* ------------------------------------------------------------------ */

function isPositive(r: string) {
  return [
    "Pass", "Qualified", "CV fit and continue to process",
    "Candidate accept offer", "Onboarded", "Open to process with GHN",
    "Contact", "Sent",
  ].includes(r)
}
function isNegative(r: string) {
  return [
    "Fail", "Unqualified", "Not fit", "CV fit but reject to process",
    "Can't contact", "Candidate reject offer", "Reject onboard",
    "Not open for new job",
  ].includes(r)
}
function isWarning(r: string) {
  return r.includes("Waiting") || r.includes("Pending")
}
function isNeutral(r: string) {
  return [
    "Skip", "Cancel", "Saved", "Closed",
    "Onboarded (BCKD) - Drop ≤ 7D", "Have new job recently",
    "Open to work but no interest with GHN", "Withdrawn",
  ].includes(r)
}

function getResultColor(result: string, isSelected: boolean, isCurrent: boolean) {
  if (isSelected) return "border-primary bg-primary/10 ring-2 ring-primary/30"
  if (isCurrent) return "border-primary/50 bg-primary/5"
  if (isPositive(result)) return "border-success/30 bg-success/5 hover:border-success/50"
  if (isNegative(result)) return "border-destructive/30 bg-destructive/5 hover:border-destructive/50"
  if (isWarning(result)) return "border-warning/30 bg-warning/5 hover:border-warning/50"
  if (isNeutral(result)) return "border-muted bg-muted/30 hover:border-muted-foreground/30"
  return "border-border bg-muted/30 hover:border-muted-foreground/30"
}

function getResultTextColor(result: string) {
  if (isPositive(result)) return "text-success"
  if (isNegative(result)) return "text-destructive"
  if (isWarning(result)) return "text-warning-foreground"
  if (isNeutral(result)) return "text-muted-foreground"
  return "text-muted-foreground"
}

export function getResultBadgeColor(result: string) {
  if (isPositive(result)) return "bg-success/15 text-success"
  if (isNegative(result)) return "bg-destructive/15 text-destructive"
  if (isWarning(result)) return "bg-warning/15 text-warning-foreground"
  if (isNeutral(result)) return "bg-muted text-muted-foreground"
  return "bg-secondary/15 text-secondary"
}

function getResultIcon(result: string) {
  if (isPositive(result)) return <CheckCircle2 className="size-3.5" />
  if (isNegative(result)) return <XCircle className="size-3.5" />
  if (isWarning(result)) return <Clock className="size-3.5" />
  if (isNeutral(result)) return <Ban className="size-3.5" />
  return <Check className="size-3.5" />
}

/**
 * Maps real pipeline stages to badge colours.
 * Uses the canonical CandidateStage values from types/api.ts.
 */
function getStageBadgeColor(stage: CandidateStage) {
  switch (stage) {
    case "Interview 1":
    case "Interview 2":
    case "Interview 3":   return "bg-info/15 text-info"
    case "Offer to Candidate": return "bg-warning/15 text-warning-foreground"
    case "Onboard Status":     return "bg-success/15 text-success"
    default:                   return "bg-muted text-muted-foreground"
  }
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface UpdateResultDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** CandidateRequest PK — used to call PATCH /pipeline/:id/steps/:stepNumber */
  candidateRequestId: string
  candidateName: string
  currentStage: CandidateStage
  /** 1-based step index matching the stage (PIPELINE_STAGES[stepNumber - 1]) */
  stepNumber: number
  /** The step's current result, or null if not yet set */
  currentResult: string | null
  /** Called after the API update succeeds so the parent can refresh data */
  onSuccess: () => void
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function UpdateResultDrawer({
  open,
  onOpenChange,
  candidateRequestId,
  candidateName,
  currentStage,
  stepNumber,
  currentResult,
  onSuccess,
}: UpdateResultDrawerProps) {
  const [selectedResult, setSelectedResult] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Reset all local state when the drawer closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedResult(null)
      setReason("")
      setApiError(null)
    }
    onOpenChange(isOpen)
  }

  const handleUpdateResult = async () => {
    if (!selectedResult) return

    setSubmitting(true)
    setApiError(null)
    try {
      await pipelineService.updateStep(candidateRequestId, stepNumber, {
        stepResult: selectedResult,
        // Only send stepNote when the user typed something
        stepNote: reason.trim() || undefined,
      })
      onSuccess()
      handleOpenChange(false)
    } catch (e: any) {
      setApiError(
        e?.response?.data?.message ||
        "Không thể cập nhật kết quả. Vui lòng thử lại."
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Last two initials of the name, upper-cased
  const initials = candidateName
    .split(" ")
    .map((n) => n[0])
    .slice(-2)
    .join("")
    .toUpperCase()

  // STAGE_RESULT_OPTIONS is the single source of truth for allowed results per stage
  const availableResults = STAGE_RESULT_OPTIONS[currentStage] ?? []

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-none sm:w-[420px] p-0 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <SheetTitle className="text-base font-semibold text-foreground">
            Update Candidate Process
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5 space-y-6">

            {/* Candidate Summary Card */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <Avatar className="size-12 border-2 border-background">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {candidateName}
                  </h3>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-muted-foreground w-20 shrink-0">Current Step</span>
                      <Badge className={`${getStageBadgeColor(currentStage)} text-[10px] border-0`}>{currentStage}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-muted-foreground w-20 shrink-0">Current Status</span>
                      {currentResult ? (
                        <Badge className={`${getResultBadgeColor(currentResult)} text-[10px] border-0`}>{currentResult}</Badge>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">No result yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Result Display */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Current Result
                </span>
                {currentResult ? (
                  <Badge
                    className={`${getResultBadgeColor(currentResult)} text-xs px-2.5 py-0.5 border-0 gap-1.5`}
                  >
                    {getResultIcon(currentResult)}
                    {currentResult}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Chưa có kết quả</span>
                )}
              </div>
            </div>

            <Separator />

            {/* Result Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Select New Result
                </h4>
                {selectedResult && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground">Changing to:</span>
                    <Badge className={`${getResultBadgeColor(selectedResult)} text-[10px] border-0`}>
                      {selectedResult}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {availableResults.map((result) => {
                  const isCurrent = result === currentResult
                  const isSelected = result === selectedResult

                  return (
                    <button
                      key={result}
                      type="button"
                      disabled={isCurrent || submitting}
                      onClick={() => setSelectedResult(result)}
                      className={cn(
                        "relative flex flex-col items-start rounded-lg border p-3 text-left transition-all",
                        getResultColor(result, isSelected, isCurrent),
                        isCurrent && "opacity-50 cursor-not-allowed",
                        !isCurrent && "cursor-pointer"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="size-4 text-primary" />
                        </div>
                      )}
                      {isCurrent && (
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant="outline"
                            className="text-[8px] px-1 py-0 border-primary/50 text-primary"
                          >
                            Current
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          isSelected ? "text-primary" : getResultTextColor(result)
                        )}>
                          {getResultIcon(result)}
                        </span>
                        <span className={cn(
                          "text-xs font-medium",
                          isSelected ? "text-primary" : getResultTextColor(result)
                        )}>
                          {result}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Reason / Notes */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Reason / Notes <span className="font-normal">(optional)</span>
              </h4>
              <Textarea
                placeholder="e.g. Candidate declined, Failed technical interview, Accepted another offer..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-20 text-sm resize-none"
                disabled={submitting}
              />
            </div>

          </div>
        </ScrollArea>

        {/* API Error Banner */}
        {apiError && (
          <div className="shrink-0 mx-6 mb-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="size-3.5 shrink-0" />
            {apiError}
          </div>
        )}

        {/* Sticky Footer */}
        <div className="shrink-0 border-t border-border bg-card px-6 py-4">
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!selectedResult || selectedResult === currentResult || submitting}
              onClick={handleUpdateResult}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {submitting ? "Saving..." : "Update Result"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
