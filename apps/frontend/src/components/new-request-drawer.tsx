"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Briefcase, ClipboardList, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import api from "@/lib/api"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Department { id: string; name: string }
interface JobTitle   { id: string; title: string; sGrade?: string }
interface Level      { id: string; name: string; leadTimeDays?: number }
interface Track      { id: string; name: string }
interface SubTrack   { id: string; name: string }
interface User       { id: string; fullName: string; email: string }

interface Meta {
  departments: Department[]
  levels:      Level[]
  tracks:      Track[]
  subTracks:   SubTrack[]
  users:       User[]
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-1">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  )
}

function FormField({
  label, required, hint, children, className,
}: {
  label: string; required?: boolean; hint?: string
  children: React.ReactNode; className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs text-muted-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
// ─── Exports for share-request-drawer ──────────────────────────────

export const hrbpList: { name: string; initials: string }[] = []

export const avatarColors = [
  "bg-primary text-primary-foreground",
  "bg-secondary text-secondary-foreground",
  "bg-chart-3 text-primary-foreground",
]

export function HrbpShareSelect({
  selected,
  onSelect,
  onRemove,
}: {
  selected: { name: string; initials: string }[]
  onSelect: (hrbp: { name: string; initials: string }) => void
  onRemove: (name: string) => void
}) {
  return (
    <div className="space-y-2">
      {selected.map((h) => (
        <div key={h.name} className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5">
          <span className="text-xs font-medium text-foreground flex-1">{h.name}</span>
          <button type="button" onClick={() => onRemove(h.name)} className="text-muted-foreground hover:text-foreground">
            <span className="text-xs">×</span>
          </button>
        </div>
      ))}
      {selected.length < 3 && (
        <p className="text-xs text-muted-foreground">Dùng dropdown Shared by 1/2/3 trong form để thêm HRBP</p>
      )}
    </div>
  )
}
export function NewRequestDrawer({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}) {
  // ── Meta data ──
  const [meta, setMeta] = useState<Meta>({
    departments: [], levels: [], tracks: [], subTracks: [], users: [],
  })
  const [jobTitles, setJobTitles]     = useState<JobTitle[]>([])
  const [loadingMeta, setLoadingMeta] = useState(false)

  // ── Form state ──
  const [form, setForm] = useState({
    openDate:          new Date().toISOString().split('T')[0],
    departmentId:      "",
    section:           "",
    team:              "",
    jobTitleId:        "",
    sGrade:            "",
    levelId:           "",
    trackId:           "",
    subTrackId:        "",
    hiringManager:     "",
    recruiterId:       "",
    shared1Id:         "",
    shared2Id:         "",
    shared3Id:         "",
    typeOfRecruitment: "New HC" as "New HC" | "Replacement",
    replaceFor:        "",
    note:              "",
  })

  // ── Submit state ──
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  // ── Load meta when drawer opens ──
  useEffect(() => {
    if (!open) return
    setLoadingMeta(true)
    Promise.all([
      api.get('/requests/meta/departments'),
      api.get('/requests/meta/levels'),
      api.get('/requests/meta/tracks'),
      api.get('/requests/meta/sub-tracks'),
      api.get('/requests/meta/users'),
    ])
      .then(([depts, levels, tracks, subTracks, users]) => {
        const currentUser = (() => {
          try { return JSON.parse(localStorage.getItem('ghn_user') || '{}') } catch { return {} }
        })()
        setMeta({
          departments: depts.data,
          levels:      levels.data,
          tracks:      tracks.data,
          subTracks:   subTracks.data,
          users:       users.data,
        })
        setForm(f => ({ ...f, recruiterId: currentUser?.id ?? "" }))
      })
      .catch(() => setError('Không thể tải dữ liệu. Vui lòng tải lại trang.'))
      .finally(() => setLoadingMeta(false))
  }, [open])

  // ── Load job titles when dept changes ──
  useEffect(() => {
    if (!form.departmentId) { setJobTitles([]); return }
    api.get(`/requests/meta/departments/${form.departmentId}/job-titles`)
      .then(r => setJobTitles(r.data))
      .catch(() => setJobTitles([]))
    setForm(f => ({ ...f, jobTitleId: "", sGrade: "" }))
  }, [form.departmentId])

  // ── Auto-fill sGrade from job title ──
  useEffect(() => {
    const jt = jobTitles.find(j => j.id === form.jobTitleId)
    setForm(f => ({ ...f, sGrade: jt?.sGrade ?? "" }))
  }, [form.jobTitleId, jobTitles])

  const set = (key: keyof typeof form, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  // ── Reset form ──
  const resetForm = () => {
    setForm({
      openDate:          new Date().toISOString().split('T')[0],
      departmentId:      "",
      section:           "",
      team:              "",
      jobTitleId:        "",
      sGrade:            "",
      levelId:           "",
      trackId:           "",
      subTrackId:        "",
      hiringManager:     "",
      recruiterId:       "",
      shared1Id:         "",
      shared2Id:         "",
      shared3Id:         "",
      typeOfRecruitment: "New HC",
      replaceFor:        "",
      note:              "",
    })
    setError(null)
    setJobTitles([])
  }

  // ── Submit ──
  const handleSubmit = async (isDraft = false) => {
    setError(null)
    if (!form.departmentId)  { setError('Vui lòng chọn Department');  return }
    if (!form.recruiterId)   { setError('Vui lòng chọn Recruiter');   return }

    setSubmitting(true)
    try {
      const payload: any = {
        openDate:          form.openDate,
        departmentId:      form.departmentId,
        typeOfRecruitment: form.typeOfRecruitment,
        recruiterId:       form.recruiterId,
      }
      if (form.section)       payload.section       = form.section
      if (form.team)          payload.team          = form.team
      if (form.jobTitleId)    payload.jobTitleId    = form.jobTitleId
      if (form.levelId)       payload.levelId       = form.levelId
      if (form.trackId)       payload.trackId       = form.trackId
      if (form.subTrackId)    payload.subTrackId    = form.subTrackId
      if (form.hiringManager) payload.hiringManager = form.hiringManager
      if (form.shared1Id)     payload.shared1Id     = form.shared1Id
      if (form.shared2Id)     payload.shared2Id     = form.shared2Id
      if (form.shared3Id)     payload.shared3Id     = form.shared3Id
      if (form.typeOfRecruitment === 'Replacement' && form.replaceFor)
        payload.replaceFor = form.replaceFor
      if (form.note) payload.note = form.note
      if (isDraft)   payload.status = 'Draft'

      console.log('[NewRequestDrawer] submit payload:', payload)
      await api.post('/requests', payload)
      console.log('[NewRequestDrawer] success')

      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (e: any) {
      const msg = e?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Tạo request thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Filtered users for shared (exclude already selected) ──
  const usersForShared1 = meta.users.filter(u => u.id !== form.recruiterId)
  const usersForShared2 = usersForShared1.filter(u => u.id !== form.shared1Id)
  const usersForShared3 = usersForShared2.filter(u => u.id !== form.shared2Id)

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v) }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-none sm:w-[48%] p-0 flex flex-col overflow-hidden"
      >
        {/* ---- Header ---- */}
        <SheetHeader className="px-6 pt-5 pb-3 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-lg">Add New Request</SheetTitle>
            <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-dashed">
              REQ-2026-XXX
            </Badge>
          </div>
          <SheetDescription>
            Fill in the recruitment request details. Fields marked with * are required.
          </SheetDescription>
        </SheetHeader>

        {/* ---- Loading ---- */}
        {loadingMeta && (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Đang tải dữ liệu...</span>
          </div>
        )}

        {/* ---- Error ---- */}
        {error && (
          <div className="mx-6 mt-3 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ---- Scrollable Body ---- */}
        {!loadingMeta && (
          <ScrollArea className="flex-1 min-h-0 px-6">
            <div className="space-y-5 py-4">

              {/* ===== Section 1: Basic Info ===== */}
              <SectionHeading icon={Briefcase} title="Basic Request Information" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">

                <FormField label="Open Date" required>
                  <Input
                    type="date"
                    value={form.openDate}
                    onChange={(e) => set('openDate', e.target.value)}
                    className="h-9"
                  />
                </FormField>

                <FormField label="Type of Recruitment" required>
                  <Select value={form.typeOfRecruitment} onValueChange={(v) => set('typeOfRecruitment', v as any)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New HC">New HC</SelectItem>
                      <SelectItem value="Replacement">Replacement</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                {form.typeOfRecruitment === 'Replacement' && (
                  <FormField label="Replace For" className="col-span-2">
                    <Input
                      placeholder="Tên người được thay thế"
                      value={form.replaceFor}
                      onChange={(e) => set('replaceFor', e.target.value)}
                      className="h-9"
                    />
                  </FormField>
                )}

                <FormField label="Department" required>
                  <Select value={form.departmentId} onValueChange={(v) => set('departmentId', v)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {meta.departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Job Title">
                  <Select
                    value={form.jobTitleId}
                    onValueChange={(v) => set('jobTitleId', v)}
                    disabled={!form.departmentId}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={form.departmentId ? "Select job title" : "Select department first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTitles.map((j) => (
                        <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="S-Grade">
                  <Input
                    value={form.sGrade || ''}
                    readOnly
                    placeholder="Auto-filled from Job Title"
                    className="h-9 bg-muted/50 text-muted-foreground"
                  />
                </FormField>

                <FormField label="Level">
                  <Select value={form.levelId} onValueChange={(v) => set('levelId', v)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {meta.levels.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}{l.leadTimeDays ? ` (${l.leadTimeDays} ngày)` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Section">
                  <Input
                    placeholder="e.g. Backend Team"
                    value={form.section}
                    onChange={(e) => set('section', e.target.value)}
                    className="h-9"
                  />
                </FormField>

                <FormField label="Team">
                  <Input
                    placeholder="e.g. Platform"
                    value={form.team}
                    onChange={(e) => set('team', e.target.value)}
                    className="h-9"
                  />
                </FormField>

                <FormField label="Track">
                  <Select value={form.trackId} onValueChange={(v) => set('trackId', v)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select track" />
                    </SelectTrigger>
                    <SelectContent>
                      {meta.tracks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Sub-Track">
                  <Select value={form.subTrackId} onValueChange={(v) => set('subTrackId', v)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select sub-track" />
                    </SelectTrigger>
                    <SelectContent>
                      {meta.subTracks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Hiring Manager" className="col-span-2">
                  <Input
                    placeholder="Tên Hiring Manager"
                    value={form.hiringManager}
                    onChange={(e) => set('hiringManager', e.target.value)}
                    className="h-9"
                  />
                </FormField>
              </div>

              <Separator />

              {/* ===== Section 2: HRBP ===== */}
              <SectionHeading icon={ClipboardList} title="HRBP in Charge" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">

                <FormField label="Recruiter (PIC)" required className="col-span-2">
                  <Select value={form.recruiterId} onValueChange={(v) => set('recruiterId', v)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select recruiter" />
                    </SelectTrigger>
                    <SelectContent>
                      {meta.users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Shared by 1">
                  <Select value={form.shared1Id} onValueChange={(v) => set('shared1Id', v)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="— None —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— None —</SelectItem>
                      {usersForShared1.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Shared by 2">
                  <Select value={form.shared2Id} onValueChange={(v) => set('shared2Id', v)} disabled={!form.shared1Id || form.shared1Id === 'none'}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="— None —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— None —</SelectItem>
                      {usersForShared2.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Shared by 3">
                  <Select value={form.shared3Id} onValueChange={(v) => set('shared3Id', v)} disabled={!form.shared2Id || form.shared2Id === 'none'}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="— None —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— None —</SelectItem>
                      {usersForShared3.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <Separator />

              {/* ===== Section 3: Note ===== */}
              <SectionHeading icon={ClipboardList} title="Note" />
              <FormField label="Ghi chú">
                <Textarea
                  placeholder="Ghi chú thêm (nếu có)..."
                  className="min-h-24 text-sm resize-y"
                  value={form.note}
                  onChange={(e) => set('note', e.target.value)}
                />
              </FormField>

              <div className="h-2" />
            </div>
          </ScrollArea>
        )}

        {/* ---- Sticky Footer ---- */}
        <SheetFooter className="flex-row justify-between border-t border-border bg-card px-6 py-3 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => { resetForm(); onOpenChange(false) }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
              Save Draft
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
              Create Request
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
