import { KpiCards } from "@/components/dashboard/kpi-cards"
import { DepartmentPerformance } from "@/components/dashboard/department-performance"
import { HrbpLeaderboard } from "@/components/dashboard/hrbp-leaderboard"
import { TimeTrend } from "@/components/dashboard/time-trend"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground text-balance">
          Recruitment KPI Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          HRBP performance tracking &middot; May 2026
        </p>
      </div>

      {/* Section 1: Overall KPI Cards */}
      <section aria-label="Overall KPI">
        <KpiCards />
      </section>

      {/* Section 2: Department Performance */}
      <section aria-label="Department Performance">
        <DepartmentPerformance />
      </section>

      {/* Section 3: HRBP Leaderboard */}
      <section aria-label="HRBP Performance">
        <HrbpLeaderboard />
      </section>

      {/* Section 4: Time Trend */}
      <section aria-label="Time Trend">
        <TimeTrend />
      </section>
    </div>
  )
}
