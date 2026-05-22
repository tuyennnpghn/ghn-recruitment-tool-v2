import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar } from "lucide-react"
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"

// -- Mock data per granularity --
const weeklyData = [
  { label: "W1", fulfillment: 55, openReq: 8, offers: 2, leadtime: 32 },
  { label: "W2", fulfillment: 58, openReq: 7, offers: 3, leadtime: 30 },
  { label: "W3", fulfillment: 61, openReq: 6, offers: 2, leadtime: 29 },
  { label: "W4", fulfillment: 63, openReq: 5, offers: 4, leadtime: 28 },
  { label: "W5", fulfillment: 67, openReq: 4, offers: 3, leadtime: 27 },
]

const monthlyData = [
  { label: "Dec", fulfillment: 42, openReq: 12, offers: 3, leadtime: 38 },
  { label: "Jan", fulfillment: 48, openReq: 10, offers: 4, leadtime: 34 },
  { label: "Feb", fulfillment: 55, openReq: 9, offers: 5, leadtime: 31 },
  { label: "Mar", fulfillment: 58, openReq: 8, offers: 4, leadtime: 29 },
  { label: "Apr", fulfillment: 63, openReq: 6, offers: 6, leadtime: 28 },
  { label: "May", fulfillment: 67, openReq: 4, offers: 5, leadtime: 27 },
]

const quarterlyData = [
  { label: "Q3 2025", fulfillment: 35, openReq: 15, offers: 8, leadtime: 42 },
  { label: "Q4 2025", fulfillment: 45, openReq: 12, offers: 10, leadtime: 36 },
  { label: "Q1 2026", fulfillment: 55, openReq: 9, offers: 13, leadtime: 31 },
  { label: "Q2 2026", fulfillment: 67, openReq: 4, offers: 11, leadtime: 27 },
]

const yearlyData = [
  { label: "2024", fulfillment: 38, openReq: 20, offers: 24, leadtime: 40 },
  { label: "2025", fulfillment: 52, openReq: 14, offers: 35, leadtime: 33 },
  { label: "2026", fulfillment: 67, openReq: 4, offers: 16, leadtime: 27 },
]

const dataMap: Record<string, typeof weeklyData> = {
  weekly: weeklyData,
  monthly: monthlyData,
  quarterly: quarterlyData,
  yearly: yearlyData,
}

const departments = ["All Departments", "Engineering", "Product", "Operations", "Marketing", "Human Resources", "Data"]
const hrbps = ["All HRBPs", "Nguyen Thi Mai", "Tran Van Duc", "Le Thi Hoa", "Pham Minh Tuan"]

const tooltipStyle = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  fontSize: "12px",
}

export function TimeTrend() {
  const [tab, setTab] = useState("monthly")
  const [dept, setDept] = useState(departments[0])
  const [hrbp, setHrbp] = useState(hrbps[0])
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const data = dataMap[tab] || monthlyData

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-sm font-semibold">Time Trend</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Date range */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-8 w-32 text-xs"
                placeholder="From"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-8 w-32 text-xs"
              />
            </div>
            {/* Department filter */}
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* HRBP filter */}
            <Select value={hrbp} onValueChange={setHrbp}>
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hrbps.map((h) => (
                  <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
            <TabsTrigger value="quarterly" className="text-xs">Quarterly</TabsTrigger>
            <TabsTrigger value="yearly" className="text-xs">Yearly</TabsTrigger>
          </TabsList>

          {/* All tabs share the same chart layout with different data */}
          {["weekly", "monthly", "quarterly", "yearly"].map((period) => (
            <TabsContent key={period} value={period} className="mt-0">
              <div className="grid grid-cols-2 gap-6">
                {/* Fulfillment Trend */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-3">Fulfillment Rate Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="fulfillment" name="Fulfillment %" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ fill: "var(--color-primary)", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Open Request Trend */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-3">Open Request Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="openReq" name="Open Requests" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Offer Trend */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-3">Offer Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="offers" name="Offers" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Leadtime Trend */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-3">Avg. Leadtime Trend (days)</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} domain={[0, 50]} unit="d" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend verticalAlign="top" height={28} iconType="line" wrapperStyle={{ fontSize: "11px" }} />
                      <Line type="monotone" dataKey="leadtime" name="Avg Leadtime" stroke="var(--color-chart-5)" strokeWidth={2.5} dot={{ fill: "var(--color-chart-5)", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
