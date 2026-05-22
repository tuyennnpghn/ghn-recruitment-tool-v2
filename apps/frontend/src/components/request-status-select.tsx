import { ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { type RequestStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Status Colors — 5 status chuẩn GHN ATS                           */
/* ------------------------------------------------------------------ */

export const statusColors: Record<RequestStatus, string> = {
  "Opening":        "bg-success/15 text-success border-success/20",
  "Pending":        "bg-warning/15 text-warning-foreground border-warning/20",
  "Accepted offer": "bg-info/15 text-info border-info/20",
  "Done":           "bg-secondary/15 text-secondary border-secondary/20",
  "Close":          "bg-muted text-muted-foreground border-border",
}

export const statusDotColors: Record<RequestStatus, string> = {
  "Opening":        "bg-success",
  "Pending":        "bg-warning",
  "Accepted offer": "bg-info",
  "Done":           "bg-secondary",
  "Close":          "bg-muted-foreground",
}

const allStatuses: RequestStatus[] = [
  "Opening",
  "Pending",
  "Accepted offer",
  "Done",
  "Close",
]

export function getRequestStatusColor(status: RequestStatus) {
  return statusColors[status] || "bg-muted text-muted-foreground"
}

/* ------------------------------------------------------------------ */
/*  Inline Status Select (for table rows)                              */
/* ------------------------------------------------------------------ */

interface RequestStatusSelectProps {
  value: RequestStatus
  onChange: (status: RequestStatus) => void
  size?: "sm" | "md" | "lg"
}

export function RequestStatusSelect({ value, onChange, size = "sm" }: RequestStatusSelectProps) {
  const sizeClasses = { sm: "h-7 text-[11px]", md: "h-8 text-xs", lg: "h-9 text-sm" }
  const badgeSizeClasses = { sm: "text-[11px] px-2 py-0.5", md: "text-xs px-2.5 py-0.5", lg: "text-sm px-3 py-1" }

  return (
    <Select value={value} onValueChange={(v) => onChange(v as RequestStatus)}>
      <SelectTrigger className={cn(
        "w-auto border-0 bg-transparent hover:bg-accent gap-1 px-0 focus:ring-0 focus:ring-offset-0",
        sizeClasses[size]
      )}>
        <Badge className={cn(statusColors[value], "border rounded-md font-medium", badgeSizeClasses[size])}>
          {value}
        </Badge>
        <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
      </SelectTrigger>
      <SelectContent align="start">
        {allStatuses.map((status) => (
          <SelectItem key={status} value={status} className="text-xs">
            <Badge className={cn(statusColors[status], "border rounded-md text-[11px] font-medium")}>
              {status}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/* ------------------------------------------------------------------ */
/*  Large Status Badge                                                 */
/* ------------------------------------------------------------------ */

interface RequestStatusBadgeLargeProps {
  status: RequestStatus
  className?: string
}

export function RequestStatusBadgeLarge({ status, className }: RequestStatusBadgeLargeProps) {
  return (
    <Badge className={cn(
      statusColors[status],
      "border rounded-lg text-base font-semibold px-4 py-1.5",
      className
    )}>
      {status}
    </Badge>
  )
}
