import { useState } from "react"
import { Link } from 'react-router-dom'
import { Search, Eye, Ban, UserPlus, Download, Trash2, Tag, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { mockCandidates } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function CandidatePoolPage() {
  const [search, setSearch] = useState("")
  const [picFilter, setPicFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [blacklistFilter, setBlacklistFilter] = useState<string>("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const pics = [...new Set(mockCandidates.map((c) => c.pic))]
  const sources = [...new Set(mockCandidates.map((c) => c.source))]

  const filtered = mockCandidates.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    const matchPic = picFilter === "all" || c.pic === picFilter
    const matchSource = sourceFilter === "all" || c.source === sourceFilter
    const matchBlacklist =
      blacklistFilter === "all" ||
      (blacklistFilter === "yes" && c.blacklist) ||
      (blacklistFilter === "no" && !c.blacklist)
    return matchSearch && matchPic && matchSource && matchBlacklist
  })

  const allSelected = filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id))
  const someSelected = selectedIds.size > 0

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)))
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground text-balance">Candidate Pool</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} candidates in database</p>
        </div>
        <Link to="/candidates/new">
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <UserPlus className="h-4 w-4" />
            Add Candidate
          </Button>
        </Link>
      </div>

      {/* Sticky Filters */}
      <div className="sticky top-0 z-10 flex items-center gap-3 rounded-lg border border-border bg-card p-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
        <Select value={picFilter} onValueChange={setPicFilter}>
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue placeholder="PIC" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All PIC</SelectItem>
            {pics.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={blacklistFilter} onValueChange={setBlacklistFilter}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue placeholder="Blacklist" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="no">Active</SelectItem>
            <SelectItem value="yes">Blacklisted</SelectItem>
          </SelectContent>
        </Select>
        {(picFilter !== "all" || sourceFilter !== "all" || blacklistFilter !== "all" || search) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={() => {
              setSearch("")
              setPicFilter("all")
              setSourceFilter("all")
              setBlacklistFilter("all")
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all candidates"
                />
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Name</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">PIC</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Source</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Company</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-center">S-Grade</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Phone</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Email</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-center">Requests</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-center">Blacklist</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => {
              const isSelected = selectedIds.has(c.id)
              return (
                <TableRow
                  key={c.id}
                  className={cn(
                    "group",
                    c.blacklist && "bg-destructive/5",
                    isSelected && "bg-primary/5"
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleOne(c.id)}
                      aria-label={`Select ${c.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Link to={`/candidates/${c.id}`} className="text-sm font-medium text-primary hover:underline">
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.pic}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.source}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.company}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[11px] font-medium">{c.sGrade}</Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{c.phone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">{c.email}</TableCell>
                  <TableCell className="text-center text-sm font-medium text-foreground">{c.currentRequests.length}</TableCell>
                  <TableCell className="text-center">
                    {c.blacklist ? (
                      <Badge className="bg-destructive text-destructive-foreground text-[10px] border-0">
                        <Ban className="h-3 w-3 mr-0.5" />
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link to={`/candidates/${c.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Bulk Action Bar */}
      {someSelected && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 shadow-lg">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.size} selected
          </span>
          <div className="h-4 w-px bg-border" />
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
            <Tag className="h-3 w-3" />
            Assign to Request
          </Button>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
            <Download className="h-3 w-3" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive">
            <Ban className="h-3 w-3" />
            Blacklist
          </Button>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive">
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
          <div className="h-4 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground"
            onClick={() => setSelectedIds(new Set())}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}
