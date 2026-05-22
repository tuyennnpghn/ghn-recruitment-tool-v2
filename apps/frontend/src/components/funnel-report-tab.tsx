import { Loader2, AlertCircle } from 'lucide-react'
import { useFunnelReport } from '@/hooks/use-funnel-report'
import { FunnelMetricCard } from '@/components/funnel-metric-card'
import type { FunnelReport } from '@/types/api'

interface FunnelReportTabProps {
  requestId: string
}

function formatRate(rate: number | null): string {
  if (rate === null) return '—'
  return `${Math.round(rate * 100)}%`
}

function rateColor(rate: number | null): string {
  if (rate === null) return 'text-muted-foreground'
  if (rate >= 0.7) return 'text-emerald-600'
  if (rate >= 0.4) return 'text-amber-500'
  return 'text-rose-600'
}

// The 6 key milestone stages shown in the funnel visualization.
// stepIndex is 0-based into stageBreakdown (stepNumber - 1).
// Interview rounds (steps 6–8) are shown separately in the pass-rates row.
// Submitted CV (step 2) is an internal tracking step — omitted from the funnel.
const FUNNEL_STAGES = [
  { stepIndex: 0, label: 'Approached',   barColor: 'bg-blue-400' },
  { stepIndex: 2, label: 'HR Screening', barColor: 'bg-indigo-400' },
  { stepIndex: 3, label: 'Send to HM',   barColor: 'bg-violet-500' },
  { stepIndex: 4, label: 'HM Feedback',  barColor: 'bg-purple-500' },
  { stepIndex: 8, label: 'Offer',        barColor: 'bg-amber-400' },
  { stepIndex: 9, label: 'Onboard',      barColor: 'bg-emerald-500' },
] as const

function ConversionStat({ label, rate }: { label: string; rate: number | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`text-2xl font-bold ${rateColor(rate)}`}>{formatRate(rate)}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function FunnelContent({ data }: { data: FunnelReport }) {
  const total = data.totalCandidates

  // Extract specific step-to-step conversion rates.
  // pair 3→4: HR Screening → Send to HM (proxy for HR screen pass rate)
  // pair 5→6: HM Feedback  → Interview 1 (proxy for HM qualified rate)
  const hrScreenRate = data.conversionRates.find(c => c.fromStep === 3 && c.toStep === 4)?.rate ?? null
  const hmQualRate   = data.conversionRates.find(c => c.fromStep === 5 && c.toStep === 6)?.rate ?? null

  return (
    <div className="space-y-5">
      {/* Row 1 — Key KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <FunnelMetricCard
          label="Total Candidates"
          value={String(total)}
          sub={data.pendingCount > 0 ? `${data.pendingCount} pending` : undefined}
        />
        <FunnelMetricCard label="Overall Conversion" value={formatRate(data.overallConvRate)} accent />
        <FunnelMetricCard label="Offer Acceptance"   value={formatRate(data.offerAcceptanceRate)} accent />
        <FunnelMetricCard label="Onboard Success"    value={formatRate(data.onboardSuccessRate)} accent />
      </div>

      {/* Row 2 — Interview pass rates */}
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Interview Pass Rates
        </p>
        <div className="grid grid-cols-3 gap-3">
          <FunnelMetricCard label="Interview 1" value={formatRate(data.interviewPassRates.interview1)} />
          <FunnelMetricCard label="Interview 2" value={formatRate(data.interviewPassRates.interview2)} />
          <FunnelMetricCard label="Interview 3" value={formatRate(data.interviewPassRates.interview3)} />
        </div>
      </div>

      {/* Row 3 — Stage funnel (left 60%) + Key conversions (right 40%) */}
      <div className="grid grid-cols-5 gap-4">
        {/* Stage funnel bars */}
        <div className="col-span-3 rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Stage Funnel
          </p>
          <div className="space-y-2.5">
            {FUNNEL_STAGES.map(({ stepIndex, label, barColor }) => {
              const count   = data.stageBreakdown[stepIndex]?.count ?? 0
              const pct     = total === 0 ? 0 : Math.round((count / total) * 100)
              const barPct  = total === 0 ? 0 : (count / total) * 100
              return (
                <div key={stepIndex} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">{label}</span>
                  <div className="flex-1 h-5 rounded-md bg-muted/50 overflow-hidden">
                    <div
                      className={`h-full rounded-md ${barColor} transition-all duration-500`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                  <span className="w-5 shrink-0 text-right text-xs font-semibold text-foreground">{count}</span>
                  <span className="w-9 shrink-0 text-right text-xs text-muted-foreground">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Key conversion rates */}
        <div className="col-span-2 rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Key Conversions
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            <ConversionStat label="HR Screen pass" rate={hrScreenRate} />
            <ConversionStat label="HM qualified"   rate={hmQualRate} />
            <ConversionStat label="Offer accepted"  rate={data.offerAcceptanceRate} />
            <ConversionStat label="Overall conv."   rate={data.overallConvRate} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function FunnelReportTab({ requestId }: FunnelReportTabProps) {
  const { data, isLoading, error } = useFunnelReport(requestId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading funnel report...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-32 gap-2">
        <AlertCircle className="h-4 w-4 text-destructive/60" />
        <span className="text-sm text-muted-foreground">{error ?? 'Unable to load funnel report'}</span>
      </div>
    )
  }

  return <FunnelContent data={data} />
}
