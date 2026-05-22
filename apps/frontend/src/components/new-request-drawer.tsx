import React, { useState, useEffect, useRef } from "react"
import { useForm, Controller } from "react-hook-form"
import type { FieldErrors } from "react-hook-form"
import { toast } from "sonner"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Briefcase,
  ClipboardList,
  FileText,
  Link2,
  Search,
  UserCheck,
  Users,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { requestService } from "@/lib/services"
import type { Department, JobTitle, Level, CreateRequestBody } from "@/types/api"

// Shape returned by GET /requests/meta/users — server already filters isActive: true
type RecruiterOption = { id: string; fullName: string; email: string; role: string }

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

// sGrade is computed server-side from jobTitleId — not a submittable DTO field.
// This list is shown in the form for reference only; the stored value comes from the job title.
const S_GRADE_OPTIONS = [
  'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7',
  'S8', 'S9', 'S10', 'S11', 'S12', 'S13',
] as const

// Aligned to backend TypeOfRecruitment enum — only these two are accepted
const requestTypes = [
  { value: 'New HC' as const,      label: 'New HC' },
  { value: 'Replacement' as const, label: 'Replacement' },
]

const urgencyLevels = [
  { value: "normal",   label: "Normal",   color: "bg-muted text-muted-foreground" },
  { value: "high",     label: "High",     color: "bg-warning text-warning-foreground" },
  { value: "critical", label: "Critical", color: "bg-destructive text-destructive-foreground" },
]
const educationLevels  = ["High School", "Associate", "Bachelor", "Master", "PhD", "Other"]
const employmentTypes  = ["Full-time", "Contract", "Intern"]
const hiringManagers   = ["Vu Minh Hoang", "Dao Thi Lan", "Bui Quoc Dung", "Nguyen Anh Thu", "Tran Thanh Son"]
const industries       = ["Technology", "E-commerce", "Fintech", "Telecom", "Manufacturing", "Conglomerate", "Ride-hailing", "Other"]

export const hrbpList: { id?: string; name: string; initials: string }[] = []

export const avatarColors = [
  "bg-primary text-primary-foreground",
  "bg-secondary text-secondary-foreground",
  "bg-chart-3 text-primary-foreground",
]

/* ------------------------------------------------------------------ */
/*  Form types                                                         */
/* ------------------------------------------------------------------ */

type TypeOfRecruitment = 'New HC' | 'Replacement'

type FormValues = {
  openDate: string
  departmentId: string
  jobTitleId: string
  levelId: string
  section: string
  team: string
  hiringManager: string
  recruiterId: string
  typeOfRecruitment: TypeOfRecruitment | ''
  replaceFor: string
  note: string
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
  label,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs text-muted-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error
        ? <p className="text-xs text-destructive">{error}</p>
        : hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>
      }
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tag Input                                                          */
/* ------------------------------------------------------------------ */

function TagInput({ placeholder, hint }: { placeholder: string; hint?: string }) {
  const [tags, setTags] = useState<string[]>([])
  const [inputVal, setInputVal] = useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inputVal.trim()) {
      e.preventDefault()
      if (!tags.includes(inputVal.trim())) {
        setTags([...tags, inputVal.trim()])
      }
      setInputVal("")
    }
    if (e.key === "Backspace" && !inputVal && tags.length) {
      setTags(tags.slice(0, -1))
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-1.5 min-h-9">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-[11px] gap-1 pl-2 pr-1 py-0.5 font-normal"
          >
            {tag}
            <button
              type="button"
              onClick={() => setTags(tags.filter((t) => t !== tag))}
              className="rounded-full hover:bg-muted-foreground/20 p-0.5"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        ))}
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-24 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>
      {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  HRBP Share Selector                                                */
/* ------------------------------------------------------------------ */

export function HrbpShareSelect({
  selected,
  onSelect,
  onRemove,
  options,
}: {
  selected: { name: string; initials: string }[]
  onSelect: (hrbp: { id?: string; name: string; initials: string }) => void
  onRemove: (name: string) => void
  options?: { id?: string; name: string; initials: string }[]
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const wrapperRef = useRef<HTMLDivElement>(null)

  const list = options ?? hrbpList
  const available = list.filter(
    (h) =>
      !selected.some((s) => s.name === h.name) &&
      h.name.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const isFull = selected.length >= 3

  return (
    <div ref={wrapperRef} className="space-y-2">
      {selected.map((h, i) => (
        <div
          key={h.name}
          className="flex items-center gap-2.5 rounded-md border border-border bg-muted/40 px-2.5 py-1.5"
        >
          <Avatar className="size-6">
            <AvatarFallback className={`${avatarColors[i % avatarColors.length]} text-[9px] font-semibold`}>
              {h.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-foreground flex-1">{h.name}</span>
          <span className="text-[10px] text-muted-foreground">Shared today</span>
          <button
            type="button"
            onClick={() => onRemove(h.name)}
            className="rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove {h.name}</span>
          </button>
        </div>
      ))}

      {!isFull && (
        <div className="relative">
          {searchOpen ? (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search HRBP..."
                className="h-8 pl-8 text-xs focus-visible:ring-[#009BE0]/20"
              />
              {available.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-border bg-popover shadow-md overflow-hidden">
                  {available.map((h) => (
                    <button
                      key={h.name}
                      type="button"
                      onClick={() => {
                        onSelect(h)
                        setQuery("")
                        if (selected.length + 1 >= 3) setSearchOpen(false)
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-accent transition-colors"
                    >
                      <Avatar className="size-5">
                        <AvatarFallback className="bg-muted text-muted-foreground text-[8px] font-semibold">
                          {h.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-foreground">{h.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {available.length === 0 && query && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-border bg-popover shadow-md p-3">
                  <p className="text-xs text-muted-foreground text-center">No matching HRBP</p>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 text-xs text-primary font-medium hover:text-primary/80 transition-colors py-1"
            >
              <Users className="h-3.5 w-3.5" />
              + Add HRBP
              {selected.length > 0 && (
                <span className="text-muted-foreground font-normal">
                  ({selected.length}/3)
                </span>
              )}
            </button>
          )}
        </div>
      )}

      {isFull && (
        <p className="text-[10px] text-muted-foreground">Maximum 3 HRBPs reached</p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function NewRequestDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [departments,  setDepartments]  = useState<Department[]>([])
  const [jobTitles,    setJobTitles]    = useState<JobTitle[]>([])
  const [levels,       setLevels]       = useState<Level[]>([])
  const [users,        setUsers]        = useState<RecruiterOption[]>([])
  const [hrbpOptions,  setHrbpOptions]  = useState<{ id: string; name: string; initials: string }[]>([])
  const [urgency,      setUrgency]      = useState("normal")
  const [sharedHrbps,  setSharedHrbps]  = useState<{ id: string; name: string; initials: string }[]>([])

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      openDate:           new Date().toISOString().slice(0, 10),
      departmentId:       '',
      jobTitleId:         '',
      levelId:            '',
      section:            '',
      team:               '',
      hiringManager:      '',
      recruiterId:        '',
      typeOfRecruitment:  '',
      replaceFor:         '',
      note:               '',
    },
  })

  const typeOfRecruitment   = watch('typeOfRecruitment')
  const watchedDepartmentId = watch('departmentId')
  const showReplaceFor      = typeOfRecruitment === 'Replacement'

  // Fetch master data every time the drawer opens; fail independently per section
  useEffect(() => {
    if (!open) return
    requestService.getDepartments()
      .then(setDepartments)
      .catch(() => toast.error('Unable to load departments'))
    requestService.getLevels()
      .then(setLevels)
      .catch(() => toast.error('Unable to load levels'))
    requestService.getRecruiters()
      .then((users) => {
        setUsers(users)
        setHrbpOptions(users.map((u) => ({
          id: u.id,
          name: u.fullName,
          initials: u.fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
        })))
      })
      .catch(() => toast.error('Unable to load HRBP list'))
  }, [open])

  // Reload job titles whenever department changes; clear stale selection
  useEffect(() => {
    setValue('jobTitleId', '')
    if (!watchedDepartmentId) {
      setJobTitles([])
      return
    }
    requestService.getJobTitlesByDepartment(watchedDepartmentId)
      .then(setJobTitles)
      .catch(() => toast.error('Unable to load job titles'))
  }, [watchedDepartmentId])

  const handleClose = () => {
    reset()
    setSharedHrbps([])
    setUrgency('normal')
    onOpenChange(false)
  }

  const onSubmit = async (values: FormValues) => {
    console.log('[CreateRequest] submit triggered, values:', values)

    const body: CreateRequestBody = {
      openDate:            values.openDate,
      departmentId:        values.departmentId,
      recruiterId:         values.recruiterId,
      typeOfRecruitment:   values.typeOfRecruitment as TypeOfRecruitment,
      ...(values.jobTitleId             ? { jobTitleId:    values.jobTitleId }             : {}),
      ...(values.levelId                ? { levelId:       values.levelId }                : {}),
      ...(values.section.trim()         ? { section:       values.section.trim() }         : {}),
      ...(values.team.trim()            ? { team:          values.team.trim() }            : {}),
      ...(values.hiringManager          ? { hiringManager: values.hiringManager }          : {}),
      ...(values.replaceFor?.trim()     ? { replaceFor:    values.replaceFor.trim() }      : {}),
      ...(values.note?.trim()           ? { note:          values.note.trim() }            : {}),
      ...(sharedHrbps[0]?.id ? { shared1Id: sharedHrbps[0].id } : {}),
      ...(sharedHrbps[1]?.id ? { shared2Id: sharedHrbps[1].id } : {}),
      ...(sharedHrbps[2]?.id ? { shared3Id: sharedHrbps[2].id } : {}),
    }

    console.log('[CreateRequest] payload:', body)

    try {
      await requestService.create(body)
      console.log('[CreateRequest] success')
      toast.success('Request created successfully')
      handleClose()
    } catch (e: unknown) {
      const errObj = e as { response?: { data?: { message?: unknown } } }
      const msg    = errObj?.response?.data?.message
      console.error('[CreateRequest] error:', e)
      toast.error(typeof msg === 'string' ? msg : 'Failed to create request')
    }
  }

  const onValidationError = (errs: FieldErrors<FormValues>) => {
    console.log('[CreateRequest] validation failed:', errs)
  }

  const handleAddHrbp = (hrbp: { id?: string; name: string; initials: string }) => {
    if (sharedHrbps.length < 3 && !sharedHrbps.some((h) => h.name === hrbp.name)) {
      setSharedHrbps([...sharedHrbps, { id: hrbp.id ?? '', name: hrbp.name, initials: hrbp.initials }])
    }
  }
  const handleRemoveHrbp = (name: string) => {
    setSharedHrbps(sharedHrbps.filter((h) => h.name !== name))
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-none sm:w-[48%] p-0 flex flex-col overflow-hidden"
      >
        {/* ---- Header ---- */}
        <SheetHeader className="px-6 pt-5 pb-3 border-b border-border">
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

        {/* ---- Form wraps scroll body + footer ---- */}
        <form
          onSubmit={handleSubmit(onSubmit, onValidationError)}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <ScrollArea className="flex-1 min-h-0 px-6">
            <div className="space-y-5 py-4">

              {/* ===== Section 1: Basic Request Information ===== */}
              <SectionHeading icon={Briefcase} title="Basic Request Information" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">

                <FormField label="Open Date" required error={errors.openDate?.message} className="col-span-2">
                  <Input
                    type="date"
                    className="h-9"
                    {...register('openDate', { required: 'Open Date is required' })}
                  />
                </FormField>

                <FormField label="Position Title" className="col-span-2">
                  <Controller
                    control={control}
                    name="jobTitleId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={!watchedDepartmentId}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={watchedDepartmentId ? 'Select position title' : 'Select department first'} />
                        </SelectTrigger>
                        <SelectContent>
                          {jobTitles.map((jt) => (
                            <SelectItem key={jt.id} value={jt.id}>{jt.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>

                <FormField label="Level">
                  <Controller
                    control={control}
                    name="levelId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map((l) => (
                            <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>

                <FormField label="S-Grade" hint="For reference — stored via job title selection">
                  <Select>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {S_GRADE_OPTIONS.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Department" required error={errors.departmentId?.message}>
                  <Controller
                    control={control}
                    name="departmentId"
                    rules={{ required: 'Department is required' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>

                <FormField label="Section">
                  <Input placeholder="e.g. Backend Team" className="h-9" {...register('section')} />
                </FormField>

                <FormField label="Team">
                  <Input placeholder="e.g. Platform" className="h-9" {...register('team')} />
                </FormField>

                <FormField label="Hiring Manager">
                  <Controller
                    control={control}
                    name="hiringManager"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                        <SelectContent>
                          {hiringManagers.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>

                <FormField label="HRBP in Charge" required error={errors.recruiterId?.message}>
                  <Controller
                    control={control}
                    name="recruiterId"
                    rules={{ required: 'HRBP in Charge is required' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select HRBP" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>

                <FormField label="Share with HRBP" hint="Max 3 collaborators" className="col-span-2">
                  <HrbpShareSelect
                    selected={sharedHrbps}
                    onSelect={handleAddHrbp}
                    onRemove={handleRemoveHrbp}
                    options={hrbpOptions}
                  />
                </FormField>

                <FormField label="Headcount" required>
                  <Input type="number" placeholder="1" min={1} className="h-9" />
                </FormField>

                <FormField label="Request Type" required error={errors.typeOfRecruitment?.message}>
                  <Controller
                    control={control}
                    name="typeOfRecruitment"
                    rules={{
                      validate: (v) =>
                        v === 'New HC' || v === 'Replacement' || 'Request Type is required',
                    }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {requestTypes.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>

                {showReplaceFor && (
                  <FormField label="Replace For" hint="Name of the person being replaced">
                    <Input placeholder="Employee name" className="h-9" {...register('replaceFor')} />
                  </FormField>
                )}

                <FormField label="Urgency Level" className={showReplaceFor ? "" : "col-span-2"}>
                  <div className="flex items-center gap-2">
                    {urgencyLevels.map((u) => (
                      <button
                        key={u.value}
                        type="button"
                        onClick={() => setUrgency(u.value)}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-xs font-medium transition-all border",
                          urgency === u.value
                            ? cn(u.color, "border-transparent ring-2 ring-ring/30")
                            : "bg-card text-muted-foreground border-border hover:border-input"
                        )}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </FormField>
              </div>

              <Separator />

              {/* ===== Section 2: Reason for Hiring ===== */}
              <SectionHeading icon={ClipboardList} title="Reason for Hiring" />
              <FormField
                label="Reason"
                required
                error={errors.note?.message}
                hint="Examples: Replacement, Business expansion, New project, Workload increase"
              >
                <Textarea
                  placeholder="Explain why this request is needed..."
                  className="min-h-28 text-sm resize-y"
                  {...register('note', { required: 'Reason is required' })}
                />
              </FormField>

              <Separator />

              {/* ===== Section 3: Candidate Requirement ===== */}
              <SectionHeading icon={UserCheck} title="Candidate Requirement" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <FormField label="Years of Experience">
                  <Input placeholder="e.g. 3-5 years" className="h-9" />
                </FormField>

                <FormField label="Industry">
                  <Select>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((i) => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Education">
                  <Select>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevels.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Employment Type">
                  <Select>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypes.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Skills / Keywords" className="col-span-2">
                  <TagInput placeholder="Type a skill and press Enter..." hint="Press Enter or comma to add a tag" />
                </FormField>

                <FormField label="Working Location" className="col-span-2">
                  <Input placeholder="e.g. Ho Chi Minh City, District 7" className="h-9" />
                </FormField>
              </div>

              <Separator />

              {/* ===== Section 4: Job Description ===== */}
              <SectionHeading icon={FileText} title="Job Description" />
              <div className="space-y-3">
                <FormField label="JD Link" hint="Paste Google Drive or internal JD link">
                  <div className="relative">
                    <Link2 className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="https://drive.google.com/xxxxx"
                      className="h-9 pl-8 text-sm"
                    />
                  </div>
                </FormField>

                <FormField label="Supporting Documents" hint="Org chart, approval form, etc. (optional)">
                  <Input
                    type="url"
                    placeholder="https://drive.google.com/... (optional)"
                    className="h-9 text-sm"
                  />
                </FormField>
              </div>

              {/* bottom spacer */}
              <div className="h-2" />
            </div>
          </ScrollArea>

          {/* ---- Sticky Footer ---- */}
          <SheetFooter className="flex-row justify-between border-t border-border bg-card px-6 py-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm">
                Save Draft
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Request'}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
