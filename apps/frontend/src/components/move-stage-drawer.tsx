import { useState } from "react"
import { Check, AlertCircle } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { PIPELINE_STAGES } from "@/types/api"
import type { CandidateStage } from "@/types/api"
import { pipelineService } from "@/lib/services"

/* ------------------------------------------------------------------ */
/*  Stage display metadata                                             */
/* ------------------------------------------------------------------ */

const STAGE_SHORT: Record<CandidateStage, string> = {
  "Successfully Approached": "Approached",
  "Submitted CV":            "CV",
  "HR Screening":            "Screening",
  "Send to HM":              "→ HM",
  "HM Feedback CV":          "HM FB",
  "Interview 1":             "Int 1",
  "Interview 2":             "Int 2",
  "Interview 3":             "Int 3",
  "Offer to Candidate":      "Offer",
  "Onboard Status":          "Onboard",
}

const STAGE_DESC: Record<CandidateStage, string> = {
  "Successfully Approached": "Tiếp cận ứng viên",
  "Submitted CV":            "CV đã được submit",
  "HR Screening":            "Vòng HR screening",
  "Send to HM":              "CV gửi Hiring Manager",
  "HM Feedback CV":          "HM feedback CV",
  "Interview 1":             "Phỏng vấn vòng 1",
  "Interview 2":             "Phỏng vấn vòng 2",
  "Interview 3":             "Phỏng vấn vòng 3",
  "Offer to Candidate":      "Gửi offer",
  "Onboard Status":          "Trạng thái onboard",
}

/* ------------------------------------------------------------------ */
/*  Color helpers                                                      */
/* ------------------------------------------------------------------ */

function getStageColor(stage: CandidateStage, isSelected: boolean, isCurrent: boolean) {
  if (isSelected) return "border-primary bg-primary/10 ring-2 ring-primary/30"
  if (isCurrent)  return "border-primary/50 bg-primary/5"
  switch (stage) {
    case "Successfully Approached":
    case "Submitted CV":
      return "border-muted bg-muted/30 hover:border-muted-foreground/30"
    case "HR Screening":
    case "Send to HM":
    case "HM Feedback CV":
      return "border-info/30 bg-info/5 hover:border-info/50"
    case "Interview 1":
    case "Interview 2":
    case "Interview 3":
      return "border-secondary/30 bg-secondary/5 hover:border-secondary/50"
    case "Offer to Candidate":
      return "border-warning/30 bg-warning/5 hover:border-warning/50"
    case "Onboard Status":
      return "border-success/30 bg-success/5 hover:border-success/50"
    default:
      return "border-border bg-muted/30 hover:border-muted-foreground/30"
  }
}

function getStageTextColor(stage: CandidateStage) {
  switch (stage) {
    case "Successfully Approached":
    case "Submitted CV":
      return "text-muted-foreground"
    case "HR Screening":
    case "Send to HM":
    case "HM Feedback CV":
      return "text-info"
    case "Interview 1":
    case "Interview 2":
    case "Interview 3":
      return "text-secondary"
    case "Offer to Candidate":
      return "text-warning-foreground"
    case "Onboard Status":
      return "text-success"
    default:
      return "text-muted-foreground"
  }
}

export function getStageBadgeColor(stage: CandidateStage | string) {
  switch (stage) {
    case "Successfully Approached":
    case "Submitted CV":
      return "bg-muted text-muted-foreground"
    case "HR Screening":
    case "Send to HM":
    case "HM Feedback CV":
      return "bg-info/15 text-info"
    case "Interview 1":
    case "Interview 2":
    case "Interview 3":
      return "bg-secondary/15 text-secondary"
    case "Offer to Candidate":
      return "bg-warning/15 text-warning-foreground"
    case "Onboard Status":
      return "bg-success/15 text-success"
    default:
      return "bg-muted text-muted-foreground"
  }
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface MoveStageDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** CandidateRequest PK — used to call POST /pipeline/:id/move-stage */
  candidateRequestId: string
  candidateName: string
  currentStage: CandidateStage
  /** Called after the API update succeeds so the parent can refresh data */
  onSuccess: () => void
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MoveStageDrawer({
  open,
  onOpenChange,
  candidateRequestId,
  candidateName,
  currentStage,
  onSuccess,
}: MoveStageDrawerProps) {
  const [selectedStage, setSelectedStage] = useState<CandidateStage | null>(null)
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Reset all local state when the drawer closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedStage(null)
      setNotes("")
      setApiError(null)
    }
    onOpenChange(isOpen)
  }

  const handleMoveStage = async () => {
    if (!selectedStage) return

    setSubmitting(true)
    setApiError(null)
    try {
      await pipelineService.moveStage(candidateRequestId, {
        targetStage: selectedStage,
        note: notes.trim() || undefined,
      })
      onSuccess()
      handleOpenChange(false)
    } catch (e: any) {
      setApiError(
        e?.response?.data?.message ||
        e?.message ||
        "Không thể chuyển bước. Vui lòng thử lại."
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

  const currentStageIndex = PIPELINE_STAGES.indexOf(currentStage)

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-none sm:w-[460px] p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <SheetTitle className="text-base font-semibold text-foreground">
            Cập nhật Pipeline Stage
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5 space-y-6">

            {/* Candidate Summary */}
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
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${getStageBadgeColor(currentStage)} text-[10px] border-0`}>
                      {currentStage}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Stepper — shows position in the 10-step pipeline */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pipeline Progress
              </h4>
              <div className="flex items-center gap-0.5 overflow-x-auto pb-2">
                {PIPELINE_STAGES.map((stage, i) => {
                  const isPast    = i < currentStageIndex
                  const isCurrent = stage === currentStage
                  const isFuture  = i > currentStageIndex
                  return (
                    <div key={stage} className="flex items-center">
                      <div className={cn(
                        "flex items-center justify-center rounded-full size-6 text-[8px] font-bold transition-colors shrink-0",
                        isPast    && "bg-success text-success-foreground",
                        isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/30",
                        isFuture  && "bg-muted text-muted-foreground"
                      )}>
                        {isPast ? <Check className="size-3" /> : i + 1}
                      </div>
                      {i < PIPELINE_STAGES.length - 1 && (
                        <div className={cn("w-3 h-0.5 shrink-0", i < currentStageIndex ? "bg-success" : "bg-border")} />
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-0.5 overflow-x-auto">
                {PIPELINE_STAGES.map((stage, i) => (
                  <div key={stage} className="flex items-center shrink-0">
                    <span className={cn(
                      "text-[8px] text-center w-6",
                      stage === currentStage && "text-primary font-semibold"
                    )}>
                      {STAGE_SHORT[stage]}
                    </span>
                    {i < PIPELINE_STAGES.length - 1 && <div className="w-3" />}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Stage Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Chọn bước mới
                </h4>
                {selectedStage && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground">→</span>
                    <Badge className={`${getStageBadgeColor(selectedStage)} text-[10px] border-0`}>
                      {selectedStage}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {PIPELINE_STAGES.map((stage) => {
                  const isCurrent  = stage === currentStage
                  const isSelected = stage === selectedStage
                  return (
                    <button
                      key={stage}
                      type="button"
                      disabled={isCurrent || submitting}
                      onClick={() => setSelectedStage(stage)}
                      className={cn(
                        "relative flex flex-col items-start rounded-lg border p-3 text-left transition-all",
                        getStageColor(stage, isSelected, isCurrent),
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
                          <Badge variant="outline" className="text-[8px] px-1 py-0 border-primary/50 text-primary">
                            Current
                          </Badge>
                        </div>
                      )}
                      <span className={cn(
                        "text-xs font-medium leading-tight",
                        isSelected ? "text-primary" : getStageTextColor(stage)
                      )}>
                        {stage}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {STAGE_DESC[stage]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ghi chú <span className="font-normal">(tuỳ chọn)</span>
              </h4>
              <Textarea
                placeholder="Kết quả, lý do chuyển bước, ghi chú từ HM..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
              Huỷ
            </Button>
            <Button
              size="sm"
              disabled={!selectedStage || selectedStage === currentStage || submitting}
              onClick={handleMoveStage}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {submitting ? "Đang lưu..." : "Xác nhận chuyển bước"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
