import { useState, useCallback, useEffect } from "react"
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, X, FileText, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { candidateService } from "@/lib/services"
import type { AuthUser, CreateCandidateBody } from "@/types/api"

// ─── Types ─────────────────────────────────────────────────────────────────

interface FormState {
  fullName: string
  picId: string
  email: string
  phone: string
  currentCompany: string
  cvLink: string
  cvSourceId: string
  industry: string
  sGrade: string
  currentSalary: string
  expectedSalary: string
  isBlacklisted: boolean
}

// ─── Constants (requirements.md §5 Module 2 — S-Grade S1–S8) ──────────────
const S_GRADES = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"]

const INDUSTRIES = [
  "Technology", "E-commerce", "Fintech", "Telecom", "Logistics",
  "Manufacturing", "Conglomerate", "Ride-hailing", "Retail", "FMCG", "Other",
]

// ─── FormField wrapper ──────────────────────────────────────────────────────
function FormField({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function CreateCandidatePage() {
  const navigate = useNavigate()

  // ── Form state ──
  const [form, setForm] = useState<FormState>(() => {
    let picId = ""
    try {
      const stored = localStorage.getItem('ghn_user')
      if (stored) picId = (JSON.parse(stored) as AuthUser).id ?? ""
    } catch { /* localStorage unavailable */ }
    return {
      fullName: "",
      picId,
      email: "",
      phone: "",
      currentCompany: "",
      cvLink: "",
      cvSourceId: "",
      industry: "",
      sGrade: "",
      currentSalary: "",
      expectedSalary: "",
      isBlacklisted: false,
    }
  })
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // ── Lookup data from API ──
  const [hrbpUsers, setHrbpUsers] = useState<Array<{ id: string; fullName: string }>>([])
  const [cvSources, setCvSources] = useState<Array<{ id: string; name: string }>>([])
  const [loadingLookups, setLoadingLookups] = useState(true)

  // ── Submission state ──
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)

  // Load HRBPs and CV Sources from API
  useEffect(() => {
    // Load HRBP users
    fetch("/api/v1/auth/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("ghn_token")}` },
    })
      .then((r) => r.json())
      .then((data: unknown) => {
        const arr: AuthUser[] = Array.isArray(data)
          ? (data as AuthUser[])
          : ((data as { items?: AuthUser[] }).items ?? [])
        setHrbpUsers(arr.filter((u) => u.isActive !== false))
      })
      .catch(() => {})

    // Load CV Sources
    fetch("/api/v1/candidates/meta/cv-sources", {
      headers: { Authorization: `Bearer ${localStorage.getItem("ghn_token")}` },
    })
      .then((r) => r.json())
      .then((data: unknown) => {
        const sources: Array<{ id: string; name: string }> = Array.isArray(data)
          ? (data as Array<{ id: string; name: string }>)
          : ((data as { items?: Array<{ id: string; name: string }> }).items ?? [])
        setCvSources(sources)
      })
      .catch(() => {})
      .finally(() => setLoadingLookups(false))
  }, [])

  // ── Drag & drop handlers ──
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f && (f.type === "application/pdf" || f.name.endsWith(".docx"))) setFile(f)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }, [])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n })
  }

  // ── Validation ──
  function validate() {
    const errs: Record<string, string> = {}
    if (!form.fullName.trim()) errs.fullName = "Bắt buộc nhập họ tên"
    if (!form.picId) errs.picId = "Bắt buộc chọn HRBP"
    if (!form.email.trim() && !form.phone.trim()) {
      errs.email = "Bắt buộc có ít nhất Email hoặc SĐT"
      errs.phone = "Bắt buộc có ít nhất Email hoặc SĐT"
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Email không hợp lệ"
    }
    return errs
  }

  // ── Submit ──
  const handleSubmit = async () => {
    setGlobalError(null)
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSaving(true)
    try {
      // 1. Create candidate
      const body: CreateCandidateBody = {
        fullName: form.fullName.trim(),
        picId: form.picId,
      }
      if (form.email.trim()) body.email = form.email.trim()
      if (form.phone.trim()) body.phone = form.phone.trim()
      if (form.currentCompany.trim()) body.currentCompany = form.currentCompany.trim()
      if (form.cvLink.trim()) body.cvLink = form.cvLink.trim()
      if (form.cvSourceId) body.cvSourceId = form.cvSourceId
      if (form.industry) body.industry = form.industry
      if (form.sGrade) body.sGrade = form.sGrade
      if (form.currentSalary.trim()) body.currentSalary = form.currentSalary.trim()
      if (form.expectedSalary.trim()) body.expectedSalary = form.expectedSalary.trim()
      if (form.isBlacklisted) body.isBlacklisted = true

      const created = await candidateService.create(body)

      // 2. Upload CV if selected
      if (file && created?.id) {
        try {
          await candidateService.uploadCv(created.id, file)
        } catch (uploadErr: unknown) {
          // Non-blocking — candidate is created, just CV upload failed
          console.warn("CV upload failed:", (uploadErr as { response?: { data?: { message?: string } } })?.response?.data?.message)
        }
      }

      navigate(`/candidates/${created.id}`)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setGlobalError(Array.isArray(msg) ? msg.join(" · ") : msg ?? "Lưu thất bại. Vui lòng thử lại.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-2">
      {/* Back */}
      <div className="flex items-center gap-4">
        <Link to="/candidates">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Add New Candidate</h1>
          <p className="text-sm text-muted-foreground">Fill in candidate details below</p>
        </div>
      </div>

      {/* Global error */}
      {globalError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {globalError}
        </div>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" required error={errors.fullName}>
              <Input
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="Nguyen Van A"
                className="h-9"
              />
            </FormField>
            <FormField label="HRBP in Charge" required error={errors.picId}>
              <Select value={form.picId} onValueChange={(v) => set("picId", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={loadingLookups ? "Loading..." : "Select PIC"} />
                </SelectTrigger>
                <SelectContent>
                  {hrbpUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email" error={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="email@example.com"
                className="h-9"
              />
            </FormField>
            <FormField label="Phone" error={errors.phone}>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="0901234567"
                className="h-9"
              />
            </FormField>
          </div>
          <p className="text-[11px] text-muted-foreground">* Bắt buộc có ít nhất Email hoặc Số điện thoại</p>
          <FormField label="Current Company">
            <Input
              value={form.currentCompany}
              onChange={(e) => set("currentCompany", e.target.value)}
              placeholder="Company name"
              className="h-9"
            />
          </FormField>
        </CardContent>
      </Card>

      {/* CV Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">CV Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:border-muted-foreground/30"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={() => setFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Drag and drop your CV here</p>
                <p className="text-xs text-muted-foreground/60 mt-1">PDF or DOCX only · Max 10MB</p>
                <label className="mt-3">
                  <input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={handleFileInput} />
                  <span className="cursor-pointer text-sm font-medium text-primary hover:underline">Browse files</span>
                </label>
              </>
            )}
          </div>
          <FormField label="CV Link (optional)">
            <Input
              value={form.cvLink}
              onChange={(e) => set("cvLink", e.target.value)}
              placeholder="https://drive.google.com/..."
              className="h-9"
            />
          </FormField>
        </CardContent>
      </Card>

      {/* Professional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Professional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Source">
              <Select value={form.cvSourceId} onValueChange={(v) => set("cvSourceId", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={loadingLookups ? "Loading..." : "Select source"} />
                </SelectTrigger>
                <SelectContent>
                  {cvSources.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Industry">
              <Select value={form.industry} onValueChange={(v) => set("industry", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="S-Grade">
              <Select value={form.sGrade} onValueChange={(v) => set("sGrade", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {S_GRADES.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Current Salary">
              <Input
                value={form.currentSalary}
                onChange={(e) => set("currentSalary", e.target.value)}
                placeholder="25000000"
                className="h-9"
              />
            </FormField>
            <FormField label="Expected Salary">
              <Input
                value={form.expectedSalary}
                onChange={(e) => set("expectedSalary", e.target.value)}
                placeholder="35000000"
                className="h-9"
              />
            </FormField>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="blacklist"
              checked={form.isBlacklisted}
              onCheckedChange={(v) => set("isBlacklisted", v)}
            />
            <Label htmlFor="blacklist" className="text-sm text-foreground cursor-pointer">
              Mark as Blacklisted
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 pb-4">
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Candidate
        </Button>
        <Link to="/candidates">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>
    </div>
  )
}
