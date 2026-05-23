import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, Mail, Phone, Building, DollarSign, Briefcase, FileText,
  Ban, ExternalLink, Download, ArrowRight, ClipboardCheck, Eye, X,
  Pencil, Calendar, Link2, Upload, RefreshCw, AlertCircle, Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { candidateService } from "@/lib/services"
import type { CandidateDetail, CandidatePipelineItem } from "@/types/api"
import { getResultBadgeColor } from "@/components/update-result-drawer"
import { cn } from "@/lib/utils"

// ─── Constants ─────────────────────────────────────────────────────────────

const S_GRADES = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"]

const INDUSTRIES = [
  "Technology", "E-commerce", "Fintech", "Telecom", "Logistics",
  "Manufacturing", "Conglomerate", "Ride-hailing", "Retail", "FMCG", "Other",
]

// ─── Helpers ───────────────────────────────────────────────────────────────

function getStageColor(stage: string) {
  if (stage === "Interview 1") return "bg-[color:hsl(214,100%,50%)]/15 text-[color:hsl(214,100%,40%)]"
  if (stage === "Interview 2") return "bg-[color:hsl(214,100%,50%)]/25 text-[color:hsl(214,100%,40%)]"
  if (stage === "Interview 3") return "bg-[color:oklch(0.45_0.115_230.5)]/15 text-[color:oklch(0.45_0.115_230.5)]"
  if (stage === "Offer to Candidate") return "bg-[color:hsl(38,92%,50%)]/15 text-[color:hsl(38,70%,30%)]"
  if (stage === "Onboard Status") return "bg-[color:hsl(142,71%,45%)]/15 text-[color:hsl(142,71%,35%)]"
  return "bg-muted text-muted-foreground"
}

function getReqStatusColor(status: string) {
  if (status === "Opening") return "bg-[color:hsl(142,71%,45%)]/15 text-[color:hsl(142,71%,35%)]"
  if (status === "Pending") return "bg-[color:hsl(38,92%,50%)]/15 text-[color:hsl(38,70%,30%)]"
  if (status === "Accepted offer" || status === "Done") return "bg-[color:oklch(0.45_0.115_230.5)]/15 text-[color:oklch(0.45_0.115_230.5)]"
  return "bg-muted text-muted-foreground"
}

const PIPELINE_STAGES = [
  "HR Screening", "Interview 1", "Interview 2",
  "Interview 3", "Offer to Candidate", "Onboard Status",
]

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground truncate">{value || "—"}</span>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function CandidateDetailPage() {
  const { id } = useParams()
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Drawers
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [updateDrawerOpen, setUpdateDrawerOpen] = useState(false)
  const [activeMatch, setActiveMatch] = useState<CandidatePipelineItem | null>(null)
  const [selectedResult, setSelectedResult] = useState<string | null>(null)
  const [updateNotes, setUpdateNotes] = useState("")

  // CV upload
  const cvInputRef = useRef<HTMLInputElement>(null)
  const [cvUploading, setCvUploading] = useState(false)

  // Edit form state
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Record<string, string>>({})

  // CV Sources for dropdown
  const [cvSources, setCvSources] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    if (!id) return
    setLoading(true)

    // Load candidate data and cv sources in parallel
    Promise.all([
      candidateService.get(id),
      fetch(`${import.meta.env.VITE_API_BASE_URL}/candidates/meta/cv-sources`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ghn_token")}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      }).then((r) => r.json()),
    ])
      .then(([data, sourcesData]) => {
        setCandidate(data)
        setEditForm({
          fullName: data.fullName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          currentCompany: (data as any).currentCompany ?? "",
          industry: (data as any).industry ?? "",
          currentSalary: data.currentSalary != null ? String(data.currentSalary) : "",
          expectedSalary: data.expectedSalary != null ? String(data.expectedSalary) : "",
          sGrade: (data as any).sGrade ?? "",
          cvLink: (data as any).cvLink ?? "",
          salaryNote: (data as any).salaryNote ?? "",
          isBlacklisted: data.isBlacklisted ? "true" : "false",
          blacklistReason: data.blacklistReason ?? "",
          cvSourceId: (data as any).cvSourceId ?? (data as any).cvSource?.id ?? "",
        })
        const sources = Array.isArray(sourcesData)
          ? sourcesData
          : (sourcesData?.items ?? [])
        setCvSources(sources)
      })
      .catch((e) => setError(e?.response?.data?.message || "Không tải được hồ sơ ứng viên"))
      .finally(() => setLoading(false))
  }, [id])

  const handleCvUpload = async (file: File) => {
    if (!id) return
    setCvUploading(true)
    try {
      await candidateService.uploadCv(id, file)
      const updated = await candidateService.get(id)
      setCandidate(updated)
      toast.success('CV uploaded successfully')
    } catch (e: unknown) {
      const errObj = e as { response?: { data?: { message?: unknown } } }
      const msg = errObj?.response?.data?.message
      toast.error(typeof msg === 'string' ? msg : 'Failed to upload CV')
    } finally {
      setCvUploading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!id) return
    setSaving(true)
    try {
      const updated = await candidateService.update(id, {
        fullName: editForm.fullName,
        email: editForm.email || undefined,
        phone: editForm.phone || undefined,
        currentCompany: editForm.currentCompany || undefined,
        industry: editForm.industry || undefined,
        sGrade: editForm.sGrade || undefined,
        currentSalary: editForm.currentSalary || undefined,
        expectedSalary: editForm.expectedSalary || undefined,
        salaryNote: editForm.salaryNote || undefined,
        cvLink: editForm.cvLink || undefined,
        cvSourceId: editForm.cvSourceId || undefined,
        isBlacklisted: editForm.isBlacklisted === "true",
        ...(editForm.isBlacklisted === "true"
          ? { blacklistReason: editForm.blacklistReason || undefined }
          : {}),
      })
      setCandidate(updated as any)
      setEditDrawerOpen(false)
    } catch (e: any) {
      alert(e?.response?.data?.message || "Lưu thất bại")
    } finally {
      setSaving(false)
    }
  }

  const openUpdateDrawer = (match: any) => {
    setActiveMatch(match)
    setSelectedResult(null)
    setUpdateNotes("")
    setUpdateDrawerOpen(true)
  }

  if (loading) return <PageSkeleton />

  if (error || !candidate) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-muted-foreground">{error || "Candidate not found."}</p>
        <Link to="/candidates"><Button variant="outline" size="sm">Back to Pool</Button></Link>
      </div>
    )
  }

  const initials = (candidate.fullName ?? "?").split(" ").filter(Boolean).map((n: string) => n[0]).slice(-2).join("")
  const picInitials = ((candidate as any).pic?.fullName ?? "?").split(" ").filter(Boolean).map((n: string) => n[0]).slice(-2).join("")
  const matchedRequests = (candidate.matchedRequests ?? []) as CandidatePipelineItem[]
  const currentStageForMatch = (m: any) => m?.currentStage ?? m?.pipelineSteps?.slice(-1)?.[0]?.stepName ?? "Successfully Approached"
  const currentResultForMatch = (m: any) => m?.overallStatus ?? null

  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-4xl mx-auto">

        {/* Back + Edit */}
        <div className="flex items-center justify-between">
          <Link to="/candidates">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />Back to Pool
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditDrawerOpen(true)}>
            <Pencil className="h-3.5 w-3.5" />Edit Candidate
          </Button>
        </div>

        {/* Header Card */}
        <Card>
          <CardContent className="px-6 py-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary/10 text-lg text-primary font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-semibold text-foreground">{candidate.fullName}</h1>
                  {candidate.isBlacklisted && (
                    <Badge className="bg-destructive text-destructive-foreground text-[10px] border-0">
                      <Ban className="h-3 w-3 mr-0.5" />Blacklisted
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{candidate.currentCompany} · {candidate.industry}</p>
              </div>
              {(candidate as any).sGrade && (
                <Badge variant="outline" className="text-sm font-semibold shrink-0">S-Grade: {(candidate as any).sGrade}</Badge>
              )}
              <div className="flex items-center gap-2 pl-4 border-l border-border shrink-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[color:oklch(0.45_0.115_230.5)]/15 text-[10px] text-[color:oklch(0.45_0.115_230.5)] font-medium">{picInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-medium text-foreground leading-tight">{(candidate as any).pic?.fullName ?? "—"}</p>
                  <p className="text-[10px] text-muted-foreground">HRBP in Charge</p>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <InfoRow icon={Mail} label="Email" value={candidate.email} />
              <InfoRow icon={Phone} label="Phone" value={candidate.phone} />
              <InfoRow icon={Building} label="Company" value={candidate.currentCompany} />
              <InfoRow icon={Briefcase} label="Industry" value={candidate.industry} />
              <InfoRow icon={DollarSign} label="Current Salary" value={candidate.currentSalary != null ? String(candidate.currentSalary) : undefined} />
              <InfoRow icon={DollarSign} label="Expected Salary" value={candidate.expectedSalary != null ? String(candidate.expectedSalary) : undefined} />
            </div>

            <Separator className="my-4" />

            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Source:</span>
                <span className="font-medium text-foreground">{(candidate as any).cvSource?.name ?? (candidate as any).cvSource ?? "—"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Updated:</span>
                <span className="font-medium text-foreground">{candidate.updatedAt?.slice(0, 10)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CV Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">CV / Resume</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            {candidate.cvs && candidate.cvs.length > 0 ? (
              <div className="space-y-2">
                {candidate.cvs.map((cv) => (
                  <div key={cv.id} className="flex items-center gap-4 rounded-lg border border-border p-4 bg-muted/20">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{cv.fileName}</p>
                      <p className="text-xs text-muted-foreground">v{cv.versionNumber} · {cv.uploadedAt?.slice(0, 10)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs"
                        onClick={async () => {
                          const url = await candidateService.getCvSignedUrl(id!, cv.id)
                          window.open(url, '_blank')
                        }}>
                        <Eye className="h-3.5 w-3.5" />View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {candidate.cvLink && (
                  <div className="flex items-center gap-4 rounded-lg border border-border p-4 bg-muted/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                      <Link2 className="h-5 w-5 text-info" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">CV Link</p>
                      <p className="text-xs text-muted-foreground truncate">{candidate.cvLink}</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5"
                      onClick={() => window.open(candidate.cvLink!, '_blank')}>
                      <ExternalLink className="h-3.5 w-3.5" />Open
                    </Button>
                  </div>
                )}
                <div className="flex items-center justify-between rounded-lg border border-dashed border-border/60 p-3 bg-muted/5">
                  <p className="text-xs text-muted-foreground">Upload CV file (PDF/DOCX, max 10MB)</p>
                  <input
                    ref={cvInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleCvUpload(file)
                      e.target.value = ''
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => cvInputRef.current?.click()}
                    disabled={cvUploading}
                  >
                    {cvUploading
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Upload className="h-3 w-3" />}
                    {cvUploading ? 'Uploading...' : 'Upload CV'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Requests */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Assigned Requests ({matchedRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5 space-y-3">
            {matchedRequests.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">No requests assigned.</p>
              </div>
            ) : (
              matchedRequests.map((match: any) => {
                const stage = currentStageForMatch(match)
                const stageIdx = PIPELINE_STAGES.indexOf(stage)
                const requestNo = match.request?.requestNo ?? match.requestNo ?? "—"
                const requestId = match.request?.id ?? match.requestId ?? ""
                return (
                  <div key={match.candidateRequestId} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Link to={`/requests/${requestId}`} className="text-sm font-medium text-primary hover:underline">
                            {requestNo}
                          </Link>
                          <Badge className="text-[10px] border-0 bg-muted text-muted-foreground">{match.request?.jobTitle?.title ?? match.position ?? ""}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${getStageColor(stage)} text-[10px] border-0`}>{stage}</Badge>
                          {match.overallStatus && (
                            <Badge className={`${getResultBadgeColor(match.overallStatus)} text-[10px] border-0`}>
                              {match.overallStatus}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openUpdateDrawer(match)}>
                              <ClipboardCheck className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">Update Result</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                              <Link to={`/requests/${requestId}`}><Eye className="h-3.5 w-3.5 text-muted-foreground" /></Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">View Request</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    {/* Pipeline bar */}
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Pipeline</p>
                      <div className="flex gap-1">
                        {PIPELINE_STAGES.map((s, i) => (
                          <div key={s} className={cn("h-1.5 flex-1 rounded-full", i <= stageIdx ? "bg-primary" : "bg-muted")} />
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Edit Drawer */}
        <Sheet open={editDrawerOpen} onOpenChange={setEditDrawerOpen}>
          <SheetContent side="right" className="w-[420px] p-0 flex flex-col overflow-hidden">
            <SheetHeader className="px-5 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-base font-semibold">Edit Candidate</SheetTitle>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditDrawerOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>
            <ScrollArea className="flex-1">
             <div className="p-4 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Full Name</Label>
                  <Input value={editForm.fullName} onChange={(e) => setEditForm(f => ({ ...f, fullName: e.target.value }))} className="h-9 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input value={editForm.email} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} type="email" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone</Label>
                    <Input value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))} className="h-9 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Company</Label>
                    <Input value={editForm.currentCompany} onChange={(e) => setEditForm(f => ({ ...f, currentCompany: e.target.value }))} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Industry</Label>
                    <Select value={editForm.industry} onValueChange={(v) => setEditForm(f => ({ ...f, industry: v }))}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((i) => (
                          <SelectItem key={i} value={i}>{i}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Source</Label>
                    <Select value={editForm.cvSourceId} onValueChange={(v) => setEditForm(f => ({ ...f, cvSourceId: v }))}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {cvSources.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">S-Grade</Label>
                    <Select value={editForm.sGrade} onValueChange={(v) => setEditForm(f => ({ ...f, sGrade: v }))}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {S_GRADES.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Current Salary</Label>
                    <Input type="number" value={editForm.currentSalary} onChange={(e) => setEditForm(f => ({ ...f, currentSalary: e.target.value }))} className="h-9 text-sm" placeholder="0" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Expected Salary</Label>
                    <Input type="number" value={editForm.expectedSalary} onChange={(e) => setEditForm(f => ({ ...f, expectedSalary: e.target.value }))} className="h-9 text-sm" placeholder="0" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Salary Note</Label>
                  <Input value={editForm.salaryNote} onChange={(e) => setEditForm(f => ({ ...f, salaryNote: e.target.value }))} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">CV Link</Label>
                  <Input value={editForm.cvLink} onChange={(e) => setEditForm(f => ({ ...f, cvLink: e.target.value }))} className="h-9 text-sm" placeholder="https://..." />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-isBlacklisted"
                    checked={editForm.isBlacklisted === "true"}
                    onChange={(e) => setEditForm(f => ({ ...f, isBlacklisted: e.target.checked ? "true" : "false" }))}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="edit-isBlacklisted" className="text-xs cursor-pointer">Blacklisted</Label>
                </div>
                {editForm.isBlacklisted === "true" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Blacklist Reason</Label>
                    <Textarea value={editForm.blacklistReason} onChange={(e) => setEditForm(f => ({ ...f, blacklistReason: e.target.value }))} className="text-sm resize-none" rows={2} />
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="border-t border-border p-4 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditDrawerOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSaveEdit} disabled={saving}>
                {saving && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Update Result Drawer */}
        <Sheet open={updateDrawerOpen} onOpenChange={setUpdateDrawerOpen}>
          <SheetContent side="right" className="w-[380px] p-0 flex flex-col">
            <SheetHeader className="px-5 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-base font-semibold">Update Result</SheetTitle>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setUpdateDrawerOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>
            <ScrollArea className="flex-1">
              <div className="p-5 space-y-5">
                <div className="rounded-lg border border-border p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground">Request</p>
                  <p className="text-sm font-medium text-primary">{activeMatch?.requestNo ?? "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Stage: <span className="font-medium text-foreground">{activeMatch ? currentStageForMatch(activeMatch) : "—"}</span></p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">Select Result</p>
                  <div className="grid grid-cols-2 gap-2">
                    {["In Progress", "Closed"].map((result) => {
                      const isSelected = result === selectedResult
                      return (
                        <button
                          key={result} type="button"
                          onClick={() => setSelectedResult(result)}
                          className={cn(
                            "flex items-start p-3 rounded-lg border text-left transition-all text-xs",
                            isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50 hover:bg-accent/50"
                          )}
                        >
                          <Badge className={`${getResultBadgeColor(result)} text-[10px] border-0`}>{result}</Badge>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Note (Optional)</Label>
                  <Textarea value={updateNotes} onChange={(e) => setUpdateNotes(e.target.value)} placeholder="Add note..." className="min-h-16 text-sm resize-none" />
                </div>
              </div>
            </ScrollArea>
            <div className="border-t border-border p-4 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setUpdateDrawerOpen(false)}>Cancel</Button>
              <Button size="sm" disabled={!selectedResult} onClick={() => setUpdateDrawerOpen(false)}>Update</Button>
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </TooltipProvider>
  )
}
