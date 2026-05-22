import { useState } from "react"
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Users,
  Bell,
  History,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Database,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"

const navItems = [
  { label: "Dashboard",          href: "/",           icon: LayoutDashboard },
  { label: "Request Management", href: "/requests",   icon: FileText },
  { label: "Candidate Pool",     href: "/candidates", icon: Users },
  { label: "Activity Log",       href: "/activity",   icon: History },
]

const adminItems = [
  { label: "Admin", href: "/admin", icon: Shield },
]

// Static placeholder notifications — will be replaced by real API in a later sprint
const notifications = [
  { id: 1, title: "Stage Update",    description: "Nguyen Van A moved to Interview 2",        time: "2h ago",  unread: true },
  { id: 2, title: "Offer Accepted",  description: "Tran Thi B accepted offer for PM",         time: "5h ago",  unread: true },
  { id: 3, title: "Leadtime Alert",  description: "REQ-2026-006 exceeded 30-day target",      time: "1d ago",  unread: true },
  { id: 4, title: "New Candidate",   description: "Truong Van L added to pool",               time: "1d ago",  unread: false },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useLocation().pathname
  const navigate  = useNavigate()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const unreadCount = notifications.filter((n) => n.unread).length

  const initials = user?.fullName
    ? user.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "U"

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex h-14 items-center gap-2.5 border-b border-sidebar-border",
          collapsed ? "justify-center px-2" : "px-3"
        )}>
          <img src="/images/ghn-logo-icon.png" alt="GHN" className="h-9 w-9 shrink-0 object-contain" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-accent-foreground">GHN ATS</span>
              <span className="text-[10px] text-sidebar-foreground/60">Recruitment Tracker</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const isActive = item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
              </Link>
            )
          })}

          {/* Admin section */}
          {user?.role === "admin" && (
            <>
              {!collapsed && (
                <div className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                  Admin
                </div>
              )}
              {collapsed && <div className="my-2 border-t border-sidebar-border" />}
              {adminItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* Collapse Button */}
        <div className="border-t border-sidebar-border p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-md p-2 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* User Profile */}
        <div className="border-t border-sidebar-border p-3">
          <div className={cn(
            "flex items-center gap-3 rounded-md px-1 py-1",
            collapsed && "justify-center"
          )}>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/20 text-xs text-primary">{initials}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden flex-1">
                <span className="truncate text-xs font-medium text-sidebar-accent-foreground">
                  {user?.fullName ?? "HRBP"}
                </span>
                <span className="truncate text-[10px] text-sidebar-foreground/50">
                  {user?.role === "admin" ? "Admin" : "HRBP"}
                </span>
              </div>
            )}
            {!collapsed && (
              <button
                id="btn-logout"
                onClick={handleLogout}
                className="ml-auto rounded p-1 text-sidebar-foreground/50 transition-colors hover:text-destructive"
                title="Đăng xuất"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {collapsed && (
            <button
              id="btn-logout-collapsed"
              onClick={handleLogout}
              className="mt-2 flex w-full items-center justify-center rounded-md p-1.5 text-sidebar-foreground/50 transition-colors hover:text-destructive hover:bg-sidebar-accent"
              title="Đăng xuất"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-6">
          {/* Global Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search candidates, requests..."
              className="h-9 pl-9 bg-muted/50 border-transparent focus-visible:border-input"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Notification Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-semibold text-foreground">Notifications</span>
                  <Link to="/notifications" className="text-xs text-primary hover:underline">
                    View all
                  </Link>
                </div>
                <DropdownMenuSeparator />
                {notifications.map((n) => (
                  <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 px-3 py-2.5 cursor-pointer">
                    <div className="flex w-full items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{n.title}</span>
                      {n.unread && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      <span className="ml-auto text-[10px] text-muted-foreground">{n.time}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{n.description}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{user?.fullName ?? "HRBP"}</p>
                  <p className="text-xs text-muted-foreground">{user?.role === "admin" ? "Admin" : "HRBP"}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
