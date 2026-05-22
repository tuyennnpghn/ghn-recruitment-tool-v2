import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Award, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface HrbpRow {
  name: string
  initials: string
  avatarColor: string
  openRequests: number
  finishedHC: number
  doneHC: number
  waitingOB: number
  inProcessing: number
  fulfillment: number
  prevFulfillment: number
}

const hrbpData: Record<string, HrbpRow[]> = {
  "May 2026": [
    { name: "Nguyen Thi Mai", initials: "NM", avatarColor: "bg-primary/80", openRequests: 3, finishedHC: 9, doneHC: 7, waitingOB: 2, inProcessing: 2, fulfillment: 75, prevFulfillment: 68 },
    { name: "Tran Van Duc", initials: "TD", avatarColor: "bg-secondary/80", openRequests: 2, finishedHC: 7, doneHC: 5, waitingOB: 2, inProcessing: 1, fulfillment: 70, prevFulfillment: 72 },
    { name: "Le Thi Hoa", initials: "LH", avatarColor: "bg-chart-3/80", openRequests: 3, finishedHC: 6, doneHC: 5, waitingOB: 1, inProcessing: 3, fulfillment: 60, prevFulfillment: 55 },
    { name: "Pham Minh Tuan", initials: "PT", avatarColor: "bg-chart-4/80", openRequests: 2, finishedHC: 6, doneHC: 5, waitingOB: 1, inProcessing: 2, fulfillment: 55, prevFulfillment: 60 },
  ],
  "Apr 2026": [
    { name: "Nguyen Thi Mai", initials: "NM", avatarColor: "bg-primary/80", openRequests: 4, finishedHC: 7, doneHC: 5, waitingOB: 2, inProcessing: 3, fulfillment: 68, prevFulfillment: 62 },
    { name: "Tran Van Duc", initials: "TD", avatarColor: "bg-secondary/80", openRequests: 3, finishedHC: 8, doneHC: 6, waitingOB: 2, inProcessing: 2, fulfillment: 72, prevFulfillment: 65 },
    { name: "Le Thi Hoa", initials: "LH", avatarColor: "bg-chart-3/80", openRequests: 2, finishedHC: 5, doneHC: 4, waitingOB: 1, inProcessing: 2, fulfillment: 55, prevFulfillment: 50 },
    { name: "Pham Minh Tuan", initials: "PT", avatarColor: "bg-chart-4/80", openRequests: 3, finishedHC: 6, doneHC: 5, waitingOB: 1, inProcessing: 3, fulfillment: 60, prevFulfillment: 58 },
  ],
  "Mar 2026": [
    { name: "Nguyen Thi Mai", initials: "NM", avatarColor: "bg-primary/80", openRequests: 5, finishedHC: 5, doneHC: 4, waitingOB: 1, inProcessing: 4, fulfillment: 62, prevFulfillment: 55 },
    { name: "Tran Van Duc", initials: "TD", avatarColor: "bg-secondary/80", openRequests: 4, finishedHC: 5, doneHC: 4, waitingOB: 1, inProcessing: 3, fulfillment: 65, prevFulfillment: 60 },
    { name: "Le Thi Hoa", initials: "LH", avatarColor: "bg-chart-3/80", openRequests: 3, finishedHC: 4, doneHC: 3, waitingOB: 1, inProcessing: 2, fulfillment: 50, prevFulfillment: 48 },
    { name: "Pham Minh Tuan", initials: "PT", avatarColor: "bg-chart-4/80", openRequests: 2, finishedHC: 5, doneHC: 4, waitingOB: 1, inProcessing: 2, fulfillment: 58, prevFulfillment: 52 },
  ],
}

const months = Object.keys(hrbpData)

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-4 w-4 text-chart-4" />
  if (rank === 2) return <Medal className="h-4 w-4 text-muted-foreground" />
  if (rank === 3) return <Award className="h-4 w-4 text-primary/60" />
  return <span className="text-xs font-medium text-muted-foreground w-4 text-center">{rank}</span>
}

function getFulfillmentColor(pct: number) {
  if (pct >= 70) return "text-success"
  if (pct >= 50) return "text-warning"
  return "text-destructive"
}

function getFulfillmentBg(pct: number) {
  if (pct >= 70) return "bg-success"
  if (pct >= 50) return "bg-warning"
  return "bg-destructive"
}

type SortField = "name" | "fulfillment" | "finishedHC"
type SortDir = "asc" | "desc"

export function HrbpLeaderboard() {
  const [selectedMonth, setSelectedMonth] = useState(months[0])
  const [sortField, setSortField] = useState<SortField>("fulfillment")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const data = [...(hrbpData[selectedMonth] || [])].sort((a, b) => {
    if (sortField === "name") {
      return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    }
    const valA = a[sortField]
    const valB = b[sortField]
    return sortDir === "asc" ? valA - valB : valB - valA
  })

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-sm font-semibold">HRBP Performance</CardTitle>
            <span className="text-[11px] text-muted-foreground">Ranked by fulfillment rate</span>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 text-center text-xs font-semibold">#</TableHead>
              <TableHead className="w-52">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 text-xs font-semibold hover:text-foreground transition-colors"
                >
                  HRBP
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="text-center w-20 text-xs font-semibold">Open Req</TableHead>
              <TableHead className="text-center w-20">
                <button
                  onClick={() => handleSort("finishedHC")}
                  className="flex items-center gap-1 text-xs font-semibold hover:text-foreground transition-colors mx-auto"
                >
                  Finished HC
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="text-center w-20 text-xs font-semibold">Done HC</TableHead>
              <TableHead className="text-center w-20 text-xs font-semibold">Waiting OB</TableHead>
              <TableHead className="text-center w-24 text-xs font-semibold">In-processing</TableHead>
              <TableHead className="w-48">
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
            {data.map((row, idx) => {
              const rank = idx + 1
              const delta = row.fulfillment - row.prevFulfillment
              return (
                <TableRow
                  key={row.name}
                  className={cn(
                    rank === 1 && "bg-chart-4/[0.04]",
                    "hover:bg-muted/40"
                  )}
                >
                  <TableCell className="text-center py-3">
                    <div className="flex items-center justify-center">
                      {getRankIcon(rank)}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className={cn("text-[10px] font-semibold text-white", row.avatarColor)}>
                          {row.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-foreground">{row.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-xs">{row.openRequests}</TableCell>
                  <TableCell className="text-center text-xs font-medium">{row.finishedHC}</TableCell>
                  <TableCell className="text-center text-xs">{row.doneHC}</TableCell>
                  <TableCell className="text-center text-xs">{row.waitingOB}</TableCell>
                  <TableCell className="text-center text-xs">{row.inProcessing}</TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full transition-all", getFulfillmentBg(row.fulfillment))}
                          style={{ width: `${row.fulfillment}%` }}
                        />
                      </div>
                      <span className={cn("text-xs font-bold w-10 text-right", getFulfillmentColor(row.fulfillment))}>
                        {row.fulfillment}%
                      </span>
                      <span className={cn(
                        "text-[10px] font-medium w-10",
                        delta > 0 ? "text-success" : delta < 0 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {delta > 0 ? `+${delta}%` : delta < 0 ? `${delta}%` : "--"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
