import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { mockActivityLogs } from "@/lib/mock-data"

function getActionColor(action: string) {
  switch (action) {
    case "Stage Update": return "bg-info/15 text-info"
    case "Candidate Added": return "bg-success/15 text-success"
    case "Offer Sent": return "bg-warning/15 text-warning-foreground"
    case "Offer Accepted": return "bg-success text-success-foreground"
    case "Onboarded": return "bg-primary/15 text-primary"
    case "Rejected": return "bg-destructive/15 text-destructive"
    case "Blacklisted": return "bg-destructive text-destructive-foreground"
    case "Request Created": return "bg-secondary/15 text-secondary"
    default: return "bg-muted text-muted-foreground"
  }
}

function getActionDotColor(action: string) {
  switch (action) {
    case "Stage Update": return "bg-info"
    case "Candidate Added": return "bg-success"
    case "Offer Sent": return "bg-warning"
    case "Offer Accepted": return "bg-success"
    case "Onboarded": return "bg-primary"
    case "Rejected": return "bg-destructive"
    case "Blacklisted": return "bg-destructive"
    case "Request Created": return "bg-secondary"
    default: return "bg-muted-foreground"
  }
}

export default function ActivityLogPage() {
  const [search, setSearch] = useState("")
  const [userFilter, setUserFilter] = useState<string>("all")
  const [actionFilter, setActionFilter] = useState<string>("all")

  const users = [...new Set(mockActivityLogs.map((l) => l.user))]
  const actions = [...new Set(mockActivityLogs.map((l) => l.action))]

  const filtered = mockActivityLogs.filter((log) => {
    const matchSearch =
      log.detail.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase())
    const matchUser = userFilter === "all" || log.user === userFilter
    const matchAction = actionFilter === "all" || log.action === actionFilter
    return matchSearch && matchUser && matchAction
  })

  // Group logs by date
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, log) => {
    if (!acc[log.date]) acc[log.date] = []
    acc[log.date].push(log)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground text-balance">Activity Logs</h1>
        <p className="text-sm text-muted-foreground">Track all recruitment actions and updates</p>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-10 flex items-center gap-3 rounded-lg border border-border bg-card p-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search actions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue placeholder="User" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((u) => (
              <SelectItem key={u} value={u}>{u}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actions.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([date, logs]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="mb-3 flex items-center gap-3">
              <span className="text-xs font-semibold text-foreground bg-muted px-2.5 py-1 rounded-md">
                {formatDate(date)}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Log Items */}
            <div className="ml-2 space-y-0">
              {logs.map((log, i) => {
                const initials = log.user.split(" ").map((n) => n[0]).slice(-2).join("")
                return (
                  <div key={log.id} className="flex gap-3">
                    {/* Timeline dot + line */}
                    <div className="flex flex-col items-center pt-1">
                      <div className={`h-2.5 w-2.5 rounded-full ${getActionDotColor(log.action)} ring-2 ring-card`} />
                      {i < logs.length - 1 && <div className="flex-1 w-px bg-border mt-1" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-5">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="bg-muted text-[8px] font-medium text-muted-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-foreground">{log.user}</span>
                        <Badge className={`${getActionColor(log.action)} text-[10px] border-0`}>
                          {log.action}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{log.detail}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">No activity logs found.</p>
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
}
