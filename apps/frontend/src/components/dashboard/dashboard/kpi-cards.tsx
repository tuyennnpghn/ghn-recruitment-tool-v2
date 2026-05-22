"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Target,
  CheckCircle2,
  PackageCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"

const kpiData = [
  {
    label: "HC KPI Target",
    value: 42,
    change: "+3 vs last month",
    trend: "up" as const,
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
    tooltip: "Total headcount target assigned for current period",
  },
  {
    label: "HC Finished",
    value: 28,
    change: "66.7% of KPI",
    trend: "up" as const,
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
    tooltip: "Candidates completed the full recruitment process",
  },
  {
    label: "HC Done",
    value: 22,
    change: "52.4% of KPI",
    trend: "up" as const,
    icon: PackageCheck,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    tooltip: "Candidates confirmed and signed contract",
  },
  {
    label: "HC Waiting OB",
    value: 6,
    change: "3 this week",
    trend: "up" as const,
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning/10",
    tooltip: "Candidates waiting for onboard date",
  },
  {
    label: "In-processing (Over Leadtime)",
    value: 8,
    change: "3 critical",
    trend: "down" as const,
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    tooltip: "Active requests that have exceeded the leadtime target",
  },
]

const fulfillmentRate = {
  value: 66.7,
  label: "Fulfillment Rate",
  subtitle: "28 / 42 HC",
  tooltip: "HC Finished / HC KPI Target",
}

export function KpiCards() {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-6 gap-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.label} className="py-4 relative overflow-hidden">
            <CardContent className="flex flex-col gap-3 px-4">
              <div className="flex items-start justify-between">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", kpi.bgColor)}>
                  <kpi.icon className={cn("h-4.5 w-4.5", kpi.color)} />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-48 text-xs">
                    {kpi.tooltip}
                  </TooltipContent>
                </Tooltip>
              </div>
              <div>
                <span className="text-3xl font-bold tracking-tight text-foreground">{kpi.value}</span>
                <div className="flex items-center gap-1 mt-1">
                  {kpi.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-success" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                  )}
                  <span className="text-[11px] text-muted-foreground">{kpi.change}</span>
                </div>
              </div>
              <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
            </CardContent>
          </Card>
        ))}

        {/* Fulfillment Rate - Highlighted Card */}
        <Card className="py-4 relative overflow-hidden border-primary/30 bg-primary/[0.03]">
          <CardContent className="flex flex-col gap-3 px-4">
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                <TrendingUp className="h-4.5 w-4.5 text-primary" />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-48 text-xs">
                  {fulfillmentRate.tooltip}
                </TooltipContent>
              </Tooltip>
            </div>
            <div>
              <span className="text-3xl font-bold tracking-tight text-primary">{fulfillmentRate.value}%</span>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-primary/15">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${fulfillmentRate.value}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{fulfillmentRate.label}</span>
              <span className="text-[11px] font-medium text-primary">{fulfillmentRate.subtitle}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
