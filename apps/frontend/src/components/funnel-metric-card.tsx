interface FunnelMetricCardProps {
  label: string
  value: string
  sub?: string
  accent?: boolean
}

export function FunnelMetricCard({ label, value, sub, accent = false }: FunnelMetricCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent ? 'text-primary' : 'text-foreground'}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}
