"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, ChevronRight, ChevronDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionRow {
  section: string
  hcKpi: number
  hcFinished: number
  hcDone: number
  hcWaitingOB: number
  inProcessing: number
}

interface DepartmentGroup {
  department: string
  sections: SectionRow[]
}

const deptData: DepartmentGroup[] = [
  {
    department: "Engineering",
    sections: [
      { section: "Backend", hcKpi: 5, hcFinished: 4, hcDone: 3, hcWaitingOB: 1, inProcessing: 1 },
      { section: "Frontend", hcKpi: 4, hcFinished: 3, hcDone: 2, hcWaitingOB: 1, inProcessing: 1 },
      { section: "DevOps", hcKpi: 2, hcFinished: 1, hcDone: 1, hcWaitingOB: 0, inProcessing: 1 },
      { section: "QA", hcKpi: 3, hcFinished: 2, hcDone: 2, hcWaitingOB: 0, inProcessing: 1 },
    ],
  },
  {
    department: "Product",
    sections: [
      { section: "Product Management", hcKpi: 3, hcFinished: 2, hcDone: 2, hcWaitingOB: 0, inProcessing: 1 },
      { section: "Business Analysis", hcKpi: 2, hcFinished: 1, hcDone: 1, hcWaitingOB: 0, inProcessing: 1 },
    ],
  },
  {
    department: "Operations",
    sections: [
      { section: "Logistics", hcKpi: 6, hcFinished: 5, hcDone: 4, hcWaitingOB: 1, inProcessing: 1 },
      { section: "Warehouse", hcKpi: 5, hcFinished: 3, hcDone: 2, hcWaitingOB: 1, inProcessing: 2 },
      { section: "Customer Support", hcKpi: 4, hcFinished: 3, hcDone: 2, hcWaitingOB: 1, inProcessing: 1 },
    ],
  },
  {
    department: "Marketing",
    sections: [
      { section: "Brand", hcKpi: 2, hcFinished: 1, hcDone: 1, hcWaitingOB: 0, inProcessing: 1 },
      { section: "Performance", hcKpi: 2, hcFinished: 1, hcDone: 1, hcWaitingOB: 0, inProcessing: 1 },
    ],
  },
  {
    department: "Human Resources",
    sections: [
      { section: "Recruitment", hcKpi: 2, hcFinished: 1, hcDone: 1, hcWaitingOB: 0, inProcessing: 1 },
      { section: "L&D", hcKpi: 1, hcFinished: 1, hcDone: 1, hcWaitingOB: 0, inProcessing: 0 },
    ],
  },
  {
    department: "Data",
    sections: [
      { section: "Data Engineering", hcKpi: 1, hcFinished: 0, hcDone: 0, hcWaitingOB: 1, inProcessing: 0 },
    ],
  },
]

function getFulfillmentColor(pct: number) {
  if (pct >= 75) return "text-success"
  if (pct >= 50) return "text-warning"
  return "text-destructive"
}

function getFulfillmentBg(pct: number) {
  if (pct >= 75) return "bg-success"
  if (pct >= 50) return "bg-warning"
  return "bg-destructive"
}

function DeptSubtotal({ sections }: { sections: SectionRow[] }) {
  return {
    hcKpi: sections.reduce((s, r) => s + r.hcKpi, 0),
    hcFinished: sections.reduce((s, r) => s + r.hcFinished, 0),
    hcDone: sections.reduce((s, r) => s + r.hcDone, 0),
    hcWaitingOB: sections.reduce((s, r) => s + r.hcWaitingOB, 0),
    inProcessing: sections.reduce((s, r) => s + r.inProcessing, 0),
  }
}

type SortField = "department" | "hcKpi" | "fulfillment"
type SortDir = "asc" | "desc"

export function DepartmentPerformance() {
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Engineering: true,
    Operations: true,
  })
  const [sortField, setSortField] = useState<SortField>("department")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const toggleExpand = (dept: string) => {
    setExpanded((prev) => ({ ...prev, [dept]: !prev[dept] }))
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const filteredData = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return deptData
    return deptData
      .map((g) => ({
        ...g,
        sections: g.sections.filter(
          (s) =>
            s.section.toLowerCase().includes(q) ||
            g.department.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.sections.length > 0)
  }, [search])

  const sortedData = useMemo(() => {
    const arr = [...filteredData]
    arr.sort((a, b) => {
      if (sortField === "department") {
        return sortDir === "asc"
          ? a.department.localeCompare(b.department)
          : b.department.localeCompare(a.department)
      }
      const subA = DeptSubtotal({ sections: a.sections })
      const subB = DeptSubtotal({ sections: b.sections })
      if (sortField === "hcKpi") {
        return sortDir === "asc" ? subA.hcKpi - subB.hcKpi : subB.hcKpi - subA.hcKpi
      }
      const fA = subA.hcKpi > 0 ? (subA.hcFinished / subA.hcKpi) * 100 : 0
      const fB = subB.hcKpi > 0 ? (subB.hcFinished / subB.hcKpi) * 100 : 0
      return sortDir === "asc" ? fA - fB : fB - fA
    })
    return arr
  }, [filteredData, sortField, sortDir])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Department Performance</CardTitle>
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search department or section..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-auto max-h-[420px]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-64">
                  <button
                    onClick={() => handleSort("department")}
                    className="flex items-center gap-1 text-xs font-semibold hover:text-foreground transition-colors"
                  >
                    Department / Section
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-center w-20">
                  <button
                    onClick={() => handleSort("hcKpi")}
                    className="flex items-center gap-1 text-xs font-semibold hover:text-foreground transition-colors mx-auto"
                  >
                    HC KPI
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-center w-20 text-xs font-semibold">HC Finished</TableHead>
                <TableHead className="text-center w-20 text-xs font-semibold">HC Done</TableHead>
                <TableHead className="text-center w-24 text-xs font-semibold">HC Waiting OB</TableHead>
                <TableHead className="text-center w-24 text-xs font-semibold">In-processing</TableHead>
                <TableHead className="w-44">
                  <button
                    onClick={() => handleSort("fulfillment")}
                    className="flex items-center gap-1 text-xs font-semibold hover:text-foreground transition-colors"
                  >
                    Fulfillment %
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((group) => {
                const sub = DeptSubtotal({ sections: group.sections })
                const fulfillPct = sub.hcKpi > 0 ? Math.round((sub.hcFinished / sub.hcKpi) * 100) : 0
                const isExpanded = expanded[group.department] ?? false

                return (
                  <DepartmentRows
                    key={group.department}
                    group={group}
                    subtotal={sub}
                    fulfillPct={fulfillPct}
                    isExpanded={isExpanded}
                    onToggle={() => toggleExpand(group.department)}
                  />
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function DepartmentRows({
  group,
  subtotal,
  fulfillPct,
  isExpanded,
  onToggle,
}: {
  group: DepartmentGroup
  subtotal: ReturnType<typeof DeptSubtotal>
  fulfillPct: number
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <>
      {/* Department header row */}
      <TableRow
        className="cursor-pointer bg-muted/40 hover:bg-muted/60 font-medium"
        onClick={onToggle}
      >
        <TableCell className="py-2.5">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="text-xs font-semibold text-foreground">{group.department}</span>
            <span className="text-[10px] text-muted-foreground">({group.sections.length} sections)</span>
          </div>
        </TableCell>
        <TableCell className="text-center text-xs font-semibold">{subtotal.hcKpi}</TableCell>
        <TableCell className="text-center text-xs font-semibold">{subtotal.hcFinished}</TableCell>
        <TableCell className="text-center text-xs font-semibold">{subtotal.hcDone}</TableCell>
        <TableCell className="text-center text-xs font-semibold">{subtotal.hcWaitingOB}</TableCell>
        <TableCell className="text-center text-xs font-semibold">{subtotal.inProcessing}</TableCell>
        <TableCell className="py-2.5">
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", getFulfillmentBg(fulfillPct))}
                style={{ width: `${fulfillPct}%` }}
              />
            </div>
            <span className={cn("text-xs font-bold w-10 text-right", getFulfillmentColor(fulfillPct))}>
              {fulfillPct}%
            </span>
          </div>
        </TableCell>
      </TableRow>

      {/* Section rows */}
      {isExpanded &&
        group.sections.map((row) => {
          const rowPct = row.hcKpi > 0 ? Math.round((row.hcFinished / row.hcKpi) * 100) : 0
          return (
            <TableRow key={row.section} className="hover:bg-muted/20">
              <TableCell className="py-2 pl-10">
                <span className="text-xs text-muted-foreground">{row.section}</span>
              </TableCell>
              <TableCell className="text-center text-xs">{row.hcKpi}</TableCell>
              <TableCell className="text-center text-xs">{row.hcFinished}</TableCell>
              <TableCell className="text-center text-xs">{row.hcDone}</TableCell>
              <TableCell className="text-center text-xs">{row.hcWaitingOB}</TableCell>
              <TableCell className="text-center text-xs">{row.inProcessing}</TableCell>
              <TableCell className="py-2">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all", getFulfillmentBg(rowPct))}
                      style={{ width: `${rowPct}%` }}
                    />
                  </div>
                  <span className={cn("text-[11px] font-medium w-10 text-right", getFulfillmentColor(rowPct))}>
                    {rowPct}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
    </>
  )
}
