import { Bell, CheckCircle2, UserPlus, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const notifications = [
  { id: 1, type: "stage", icon: CheckCircle2, color: "text-success", title: "Stage Update", description: "Nguyen Van A moved to Interview 2 for REQ-2026-001", time: "2 hours ago", read: false },
  { id: 2, type: "offer", icon: UserPlus, color: "text-primary", title: "Offer Accepted", description: "Tran Thi B accepted the offer for Product Manager position", time: "5 hours ago", read: false },
  { id: 3, type: "alert", icon: AlertTriangle, color: "text-warning", title: "Leadtime Alert", description: "REQ-2026-006 has exceeded 30-day leadtime target", time: "1 day ago", read: false },
  { id: 4, type: "stage", icon: CheckCircle2, color: "text-info", title: "New Candidate", description: "Truong Van L added to Candidate Pool by Le Thi Hoa", time: "1 day ago", read: true },
  { id: 5, type: "stage", icon: CheckCircle2, color: "text-success", title: "Onboarded", description: "Ly Thi K successfully onboarded for REQ-2026-004", time: "3 days ago", read: true },
]

export default function NotificationsPage() {
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground text-balance">Notifications</h1>
          <p className="text-sm text-muted-foreground">{notifications.filter((n) => !n.read).length} unread notifications</p>
        </div>
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <Card key={n.id} className={`py-0 ${!n.read ? "border-primary/20 bg-primary/[0.02]" : ""}`}>
            <CardContent className="flex items-start gap-3 px-4 py-3">
              <div className={`mt-0.5 ${n.color}`}>
                <n.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.description}</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">{n.time}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
