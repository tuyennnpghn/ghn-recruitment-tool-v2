import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Shield, Users, Settings, Database, ClipboardList } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { adminService } from "@/lib/services"

const adminSections = [
  { 
    title: "User Management", 
    description: "Manage HRBP users, roles, and permissions", 
    icon: Users, 
    count: "5 active users",
    href: "/admin/users"
  },
  { 
    title: "ATS Configuration", 
    description: "Request statuses, pipeline stages, result tags", 
    icon: Settings, 
    count: "12 settings",
    href: "/admin/configuration"
  },
  { 
    title: "Import / Export Center", 
    description: "Import candidates, export data, manage backups", 
    icon: Database, 
    count: "Last export: 2h ago",
    href: "/admin/data"
  },
  { 
    title: "Role Management", 
    description: "Configure roles and access permissions", 
    icon: Shield, 
    count: "2 roles configured",
    href: "/admin/roles"
  },
  { 
    title: "Activity Audit", 
    description: "Track all user actions and system changes", 
    icon: ClipboardList, 
    count: "128 events today",
    href: "/admin/audit"
  },
]

export default function AdminPage() {
  const [todayCount, setTodayCount] = useState<number | null>(null)

  useEffect(() => {
    const from = new Date()
    from.setHours(0, 0, 0, 0)
    adminService.listActivityLogs({ from: from.toISOString(), limit: 1 })
      .then((r: unknown) => {
        const res = r as { total: number }
        setTodayCount(res.total)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground text-balance">Admin Center</h1>
        <p className="text-sm text-muted-foreground">System administration and configuration</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {adminSections.map((section) => (
          <Link key={section.title} to={section.href}>
            <Card className="h-full cursor-pointer transition-colors hover:border-primary/30 hover:bg-accent/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{section.title}</CardTitle>
                    <CardDescription className="text-xs">{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {section.href === '/admin/audit'
                    ? todayCount !== null ? `${todayCount} events today` : 'Loading…'
                    : section.count}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
