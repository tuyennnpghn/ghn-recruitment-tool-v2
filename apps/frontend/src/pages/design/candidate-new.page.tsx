import { useState, useCallback } from "react"
import { Link } from 'react-router-dom'
import { ArrowLeft, Upload, X, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

const sources = ["LinkedIn", "TopCV", "CareerBuilder", "Referral", "Job Fair", "Website", "Other"]
const industries = ["Technology", "E-commerce", "Fintech", "Telecom", "Manufacturing", "Conglomerate", "Ride-hailing", "Other"]
const sGrades = ["S1", "S2", "S3", "S4", "S5", "S6", "S7"]

export default function CreateCandidatePage() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".docx")) {
        setFile(droppedFile)
      }
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }, [])

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back */}
      <div className="flex items-center gap-4">
        <Link to="/candidates">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Add New Candidate</h1>
          <p className="text-sm text-muted-foreground">Fill in candidate details below</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" required>
              <Input placeholder="Nguyen Van A" className="h-9" />
            </FormField>
            <FormField label="HRBP in Charge" required>
              <Select>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select PIC" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nguyen Thi Mai">Nguyen Thi Mai</SelectItem>
                  <SelectItem value="Tran Van Duc">Tran Van Duc</SelectItem>
                  <SelectItem value="Le Thi Hoa">Le Thi Hoa</SelectItem>
                  <SelectItem value="Pham Minh Tuan">Pham Minh Tuan</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email" required>
              <Input type="email" placeholder="email@example.com" className="h-9" />
            </FormField>
            <FormField label="Phone" required>
              <Input type="tel" placeholder="0901234567" className="h-9" />
            </FormField>
          </div>
          <FormField label="Current Company">
            <Input placeholder="Company name" className="h-9" />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">CV Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag and Drop */}
          <div
            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/30 hover:border-muted-foreground/30"
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground"
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Drag and drop your CV here</p>
                <p className="text-xs text-muted-foreground/60 mt-1">PDF or DOCX only</p>
                <label className="mt-3">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                  <span className="cursor-pointer text-sm font-medium text-primary hover:underline">
                    Browse files
                  </span>
                </label>
              </>
            )}
          </div>
          <FormField label="CV Link (optional)">
            <Input placeholder="https://drive.google.com/..." className="h-9" />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Professional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Source" required>
              <Select>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <FormField label="S-Grade" required>
              <Select>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {sGrades.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Current Salary">
              <Input placeholder="25,000,000 VND" className="h-9" />
            </FormField>
            <FormField label="Expected Salary">
              <Input placeholder="35,000,000 VND" className="h-9" />
            </FormField>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="blacklist" />
            <Label htmlFor="blacklist" className="text-sm text-foreground cursor-pointer">
              Mark as Blacklisted
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 pb-4">
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Save Candidate
        </Button>
        <Link to="/candidates">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>
    </div>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  )
}
