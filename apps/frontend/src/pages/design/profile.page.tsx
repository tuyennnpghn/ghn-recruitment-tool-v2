import { User, Mail, Phone, Building, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground text-balance">Profile</h1>
        <p className="text-sm text-muted-foreground">Your account settings and preferences</p>
      </div>

      <Card>
        <CardContent className="px-6 py-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-lg text-primary-foreground font-semibold">
                NT
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">Nguyen Tuyen</h2>
              <p className="text-sm text-muted-foreground">HRBP Lead</p>
              <Badge variant="outline" className="mt-1 text-[11px]">
                <Shield className="mr-1 h-3 w-3" />
                Admin
              </Badge>
            </div>
          </div>

          <Separator className="my-5" />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Email</p>
                <p className="text-sm text-foreground">tuyen.nguyen@ghn.vn</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Phone</p>
                <p className="text-sm text-foreground">0901 234 567</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Building className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Department</p>
                <p className="text-sm text-foreground">Human Resources</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Employee ID</p>
                <p className="text-sm text-foreground">GHN-HR-001</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive email alerts for stage updates</p>
            </div>
            <Badge className="bg-success text-success-foreground text-[10px] border-0">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Leadtime Alerts</p>
              <p className="text-xs text-muted-foreground">Alert when requests exceed 30-day target</p>
            </div>
            <Badge className="bg-success text-success-foreground text-[10px] border-0">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Weekly Digest</p>
              <p className="text-xs text-muted-foreground">Summary report every Monday</p>
            </div>
            <Badge className="bg-muted text-muted-foreground text-[10px] border-0">Disabled</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
