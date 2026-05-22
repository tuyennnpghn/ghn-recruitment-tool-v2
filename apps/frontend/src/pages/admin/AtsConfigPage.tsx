import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminService } from "@/lib/services"
import { toast } from "sonner"

// ─── Types ───────────────────────────────────────────────────────────────────

interface SimpleItem {
  id: string
  name: string
  extra?: string | number | null
}

interface ExtraFieldDef {
  label: string
  colHeader: string
  type: "text" | "number"
  optional: boolean
}

interface LevelItem { id: string; name: string; leadTimeDays: number | null }
interface DeptItem  { id: string; code: string; name: string }
interface JobTitleItem {
  id: string
  title: string
  sGrade: string | null
  departmentId: string
  department: { id: string; name: string }
}

// ─── SimpleTab ───────────────────────────────────────────────────────────────

interface SimpleTabProps {
  label: string
  items: SimpleItem[]
  loading: boolean
  extraField?: ExtraFieldDef
  onAdd:    (name: string, extra?: string) => Promise<void>
  onEdit:   (id: string, name: string, extra?: string) => Promise<void>
  onDelete: (id: string, name: string) => Promise<void>
}

function SimpleTab({ label, items, loading, extraField, onAdd, onEdit, onDelete }: SimpleTabProps) {
  const [search, setSearch]         = useState("")
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "delete" | null>(null)
  const [selected, setSelected]     = useState<SimpleItem | null>(null)
  const [formName, setFormName]     = useState("")
  const [formExtra, setFormExtra]   = useState("")
  const [saving, setSaving]         = useState(false)

  function openAdd() {
    setFormName(""); setFormExtra(""); setSelected(null); setDialogMode("add")
  }
  function openEdit(item: SimpleItem) {
    setFormName(item.name)
    setFormExtra(item.extra != null ? String(item.extra) : "")
    setSelected(item); setDialogMode("edit")
  }
  function openDelete(item: SimpleItem) { setSelected(item); setDialogMode("delete") }
  function closeDialog() { setDialogMode(null); setSelected(null) }

  function validate() {
    if (!formName.trim()) { toast.error("Name is required"); return false }
    if (extraField && !extraField.optional && !formExtra.trim()) {
      toast.error(`${extraField.label} is required`); return false
    }
    return true
  }

  async function handleSubmit() {
    if (!validate()) return
    if (dialogMode === "edit" && !selected) return
    setSaving(true)
    try {
      if (dialogMode === "add") {
        await onAdd(formName.trim(), formExtra.trim() || undefined)
        toast.success(`${label} created`)
      } else {
        await onEdit(selected!.id, formName.trim(), formExtra.trim() || undefined)
        toast.success(`${label} updated`)
      }
      closeDialog()
    } catch {
      toast.error(`Failed to ${dialogMode === "add" ? "create" : "update"} ${label.toLowerCase()}`)
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!selected) return
    setSaving(true)
    try {
      await onDelete(selected.id, selected.name)
      toast.success(`${label} deleted`)
      closeDialog()
    } catch {
      toast.error(`Failed to delete ${label.toLowerCase()}`)
    } finally { setSaving(false) }
  }

  const colSpan = extraField ? 3 : 2
  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-3 pt-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{items.length} entries</span>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" />Add
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder={`Search ${label.toLowerCase()}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {extraField && <TableHead>{extraField.colHeader}</TableHead>}
              <TableHead className="w-[90px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-10 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-10 text-center text-sm text-muted-foreground">
                  No entries found
                </TableCell>
              </TableRow>
            ) : filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                {extraField && (
                  <TableCell className="text-muted-foreground">
                    {item.extra != null ? String(item.extra) : "N/A"}
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Delete" onClick={() => openDelete(item)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogMode === "add" || dialogMode === "edit"} onOpenChange={(o) => { if (!o) closeDialog() }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? `Add ${label}` : `Edit ${label}`}</DialogTitle>
            {dialogMode === "edit" && selected && (
              <DialogDescription>Editing: {selected.name}</DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={`${label} name`}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
              />
            </div>
            {extraField && (
              <div className="space-y-1">
                <Label>
                  {extraField.label}
                  {extraField.optional && (
                    <span className="ml-1 text-xs text-muted-foreground">(optional)</span>
                  )}
                </Label>
                <Input
                  type={extraField.type}
                  value={formExtra}
                  onChange={(e) => setFormExtra(e.target.value)}
                  placeholder={extraField.optional ? "Leave blank for N/A" : extraField.label}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {dialogMode === "add" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={dialogMode === "delete"} onOpenChange={(o) => { if (!o) closeDialog() }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {label}</DialogTitle>
            <DialogDescription>
              Delete <strong>{selected?.name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── JobTitleTab ──────────────────────────────────────────────────────────────

interface JobTitleTabProps {
  items:       JobTitleItem[]
  departments: DeptItem[]
  loading:     boolean
  onAdd:    (departmentId: string, title: string, sGrade?: string) => Promise<void>
  onEdit:   (id: string, title: string, sGrade?: string) => Promise<void>
  onDelete: (id: string, title: string) => Promise<void>
}

function JobTitleTab({ items, departments, loading, onAdd, onEdit, onDelete }: JobTitleTabProps) {
  const [search, setSearch]         = useState("")
  const [deptFilter, setDeptFilter] = useState("all")
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "delete" | null>(null)
  const [selected, setSelected]     = useState<JobTitleItem | null>(null)
  const [formDeptId, setFormDeptId] = useState("")
  const [formTitle, setFormTitle]   = useState("")
  const [formSGrade, setFormSGrade] = useState("")
  const [saving, setSaving]         = useState(false)

  function openAdd() {
    setFormDeptId(""); setFormTitle(""); setFormSGrade("")
    setSelected(null); setDialogMode("add")
  }
  function openEdit(jt: JobTitleItem) {
    setFormTitle(jt.title); setFormSGrade(jt.sGrade ?? "")
    setSelected(jt); setDialogMode("edit")
  }
  function openDelete(jt: JobTitleItem) { setSelected(jt); setDialogMode("delete") }
  function closeDialog() { setDialogMode(null); setSelected(null) }

  async function handleAdd() {
    if (!formDeptId)      { toast.error("Department is required"); return }
    if (!formTitle.trim()) { toast.error("Title is required"); return }
    setSaving(true)
    try {
      await onAdd(formDeptId, formTitle.trim(), formSGrade.trim() || undefined)
      toast.success("Job title created")
      closeDialog()
    } catch {
      toast.error("Failed to create job title")
    } finally { setSaving(false) }
  }

  async function handleEdit() {
    if (!selected || !formTitle.trim()) { toast.error("Title is required"); return }
    setSaving(true)
    try {
      await onEdit(selected.id, formTitle.trim(), formSGrade.trim() || undefined)
      toast.success("Job title updated")
      closeDialog()
    } catch {
      toast.error("Failed to update job title")
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!selected) return
    setSaving(true)
    try {
      await onDelete(selected.id, selected.title)
      toast.success("Job title deleted")
      closeDialog()
    } catch {
      toast.error("Failed to delete job title")
    } finally { setSaving(false) }
  }

  const filtered = items.filter((jt) => {
    const matchesDept   = deptFilter === "all" || jt.departmentId === deptFilter
    const matchesSearch = jt.title.toLowerCase().includes(search.toLowerCase()) ||
                          jt.department.name.toLowerCase().includes(search.toLowerCase())
    return matchesDept && matchesSearch
  })

  return (
    <div className="space-y-3 pt-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{items.length} entries</span>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" />Add
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search job titles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>S-Grade</TableHead>
              <TableHead className="w-[90px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  No job titles found
                </TableCell>
              </TableRow>
            ) : filtered.map((jt) => (
              <TableRow key={jt.id}>
                <TableCell className="text-sm text-muted-foreground">{jt.department.name}</TableCell>
                <TableCell className="font-medium">{jt.title}</TableCell>
                <TableCell className="text-muted-foreground">{jt.sGrade ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(jt)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Delete" onClick={() => openDelete(jt)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add dialog */}
      <Dialog open={dialogMode === "add"} onOpenChange={(o) => { if (!o) closeDialog() }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Job Title</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Department</Label>
              <Select value={formDeptId} onValueChange={setFormDeptId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div className="space-y-1">
              <Label>
                S-Grade
                <span className="ml-1 text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input
                value={formSGrade}
                onChange={(e) => setFormSGrade(e.target.value)}
                placeholder="e.g. S2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={dialogMode === "edit"} onOpenChange={(o) => { if (!o) closeDialog() }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Job Title</DialogTitle>
            {selected && (
              <DialogDescription>
                {selected.department.name} — {selected.title}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>
                S-Grade
                <span className="ml-1 text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input
                value={formSGrade}
                onChange={(e) => setFormSGrade(e.target.value)}
                placeholder="e.g. S2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={dialogMode === "delete"} onOpenChange={(o) => { if (!o) closeDialog() }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Job Title</DialogTitle>
            <DialogDescription>
              Delete <strong>{selected?.title}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── AtsConfigPage ────────────────────────────────────────────────────────────

export default function AtsConfigPage() {
  const [sources,   setSources]   = useState<SimpleItem[]>([])
  const [levels,    setLevels]    = useState<LevelItem[]>([])
  const [depts,     setDepts]     = useState<DeptItem[]>([])
  const [jobTitles, setJobTitles] = useState<JobTitleItem[]>([])
  const [tracks,    setTracks]    = useState<SimpleItem[]>([])
  const [subTracks, setSubTracks] = useState<SimpleItem[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      adminService.listCvSources(),
      adminService.listLevels(),
      adminService.listDepartments(),
      adminService.listJobTitles(),
      adminService.listTracks(),
      adminService.listSubTracks(),
    ])
      .then(([s, l, d, jt, t, st]) => {
        setSources(  s  as SimpleItem[])
        setLevels(   l  as LevelItem[])
        setDepts(    d  as DeptItem[])
        setJobTitles(jt as JobTitleItem[])
        setTracks(   t  as SimpleItem[])
        setSubTracks(st as SimpleItem[])
      })
      .catch(() => toast.error("Failed to load configuration data"))
      .finally(() => setLoading(false))
  }, [])

  async function refreshSources()   { setSources(  await adminService.listCvSources()    as SimpleItem[]) }
  async function refreshLevels()    { setLevels(   await adminService.listLevels()        as LevelItem[]) }
  async function refreshDepts()     { setDepts(    await adminService.listDepartments()   as DeptItem[]) }
  async function refreshJobTitles() { setJobTitles(await adminService.listJobTitles()     as JobTitleItem[]) }
  async function refreshTracks()    { setTracks(   await adminService.listTracks()        as SimpleItem[]) }
  async function refreshSubTracks() { setSubTracks(await adminService.listSubTracks()     as SimpleItem[]) }

  // ── Sources ────────────────────────────────────────────────────────────────
  async function srcAdd(name: string) {
    await adminService.createCvSource(name); await refreshSources()
  }
  async function srcEdit(id: string, name: string) {
    await adminService.updateCvSource(id, name); await refreshSources()
  }
  async function srcDelete(id: string) {
    await adminService.deleteCvSource(id); await refreshSources()
  }

  // ── Levels ─────────────────────────────────────────────────────────────────
  async function lvlAdd(name: string, extra?: string) {
    const days = extra ? parseInt(extra, 10) : null
    await adminService.createLevel(name, isNaN(days as number) ? null : days)
    await refreshLevels()
  }
  async function lvlEdit(id: string, name: string, extra?: string) {
    const days = extra ? parseInt(extra, 10) : null
    await adminService.updateLevel(id, name, isNaN(days as number) ? null : days)
    await refreshLevels()
  }
  async function lvlDelete(id: string) {
    await adminService.deleteLevel(id); await refreshLevels()
  }

  // ── Departments ────────────────────────────────────────────────────────────
  // extra = code (required), name = department name
  async function deptAdd(name: string, extra?: string) {
    await adminService.createDepartment(extra!, name); await refreshDepts()
  }
  async function deptEdit(id: string, name: string, extra?: string) {
    await adminService.updateDepartment(id, { name, ...(extra && { code: extra }) })
    await refreshDepts()
  }
  async function deptDelete(id: string) {
    await adminService.deleteDepartment(id); await refreshDepts()
  }

  // ── Job Titles ─────────────────────────────────────────────────────────────
  async function jtAdd(departmentId: string, title: string, sGrade?: string) {
    await adminService.createJobTitle(departmentId, title, sGrade ?? null)
    await refreshJobTitles()
  }
  async function jtEdit(id: string, title: string, sGrade?: string) {
    await adminService.updateJobTitle(id, { title, sGrade: sGrade ?? null })
    await refreshJobTitles()
  }
  async function jtDelete(id: string) {
    await adminService.deleteJobTitle(id); await refreshJobTitles()
  }

  // ── Tracks ─────────────────────────────────────────────────────────────────
  async function trkAdd(name: string) {
    await adminService.createTrack(name); await refreshTracks()
  }
  async function trkEdit(id: string, name: string) {
    await adminService.updateTrack(id, name); await refreshTracks()
  }
  async function trkDelete(id: string) {
    await adminService.deleteTrack(id); await refreshTracks()
  }

  // ── Sub Tracks ─────────────────────────────────────────────────────────────
  async function stAdd(name: string) {
    await adminService.createSubTrack(name); await refreshSubTracks()
  }
  async function stEdit(id: string, name: string) {
    await adminService.updateSubTrack(id, name); await refreshSubTracks()
  }
  async function stDelete(id: string) {
    await adminService.deleteSubTrack(id); await refreshSubTracks()
  }

  // Normalize levels/depts to SimpleItem shape for SimpleTab
  const levelItems: SimpleItem[] = levels.map((l) => ({
    id:    l.id,
    name:  l.name,
    extra: l.leadTimeDays,
  }))
  const deptItems: SimpleItem[] = depts.map((d) => ({
    id:    d.id,
    name:  d.name,
    extra: d.code,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">ATS Configuration</h1>
        <p className="text-sm text-muted-foreground">Manage recruitment configuration data</p>
      </div>

      <Tabs defaultValue="sources">
        <TabsList>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="levels">Levels</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="job-titles">Job Title-S-Grade</TabsTrigger>
          <TabsTrigger value="tracks">Tracks</TabsTrigger>
          <TabsTrigger value="sub-tracks">Sub Tracks</TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          <SimpleTab
            label="Source"
            items={sources}
            loading={loading}
            onAdd={srcAdd}
            onEdit={srcEdit}
            onDelete={async (id) => srcDelete(id)}
          />
        </TabsContent>

        <TabsContent value="levels">
          <SimpleTab
            label="Level"
            items={levelItems}
            loading={loading}
            extraField={{ label: "Lead Time (days)", colHeader: "Lead Time", type: "number", optional: true }}
            onAdd={lvlAdd}
            onEdit={lvlEdit}
            onDelete={async (id) => lvlDelete(id)}
          />
        </TabsContent>

        <TabsContent value="departments">
          <SimpleTab
            label="Department"
            items={deptItems}
            loading={loading}
            extraField={{ label: "Code", colHeader: "Code", type: "text", optional: false }}
            onAdd={deptAdd}
            onEdit={deptEdit}
            onDelete={async (id) => deptDelete(id)}
          />
        </TabsContent>

        <TabsContent value="job-titles">
          <JobTitleTab
            items={jobTitles}
            departments={depts}
            loading={loading}
            onAdd={jtAdd}
            onEdit={jtEdit}
            onDelete={async (id) => jtDelete(id)}
          />
        </TabsContent>

        <TabsContent value="tracks">
          <SimpleTab
            label="Track"
            items={tracks}
            loading={loading}
            onAdd={trkAdd}
            onEdit={trkEdit}
            onDelete={async (id) => trkDelete(id)}
          />
        </TabsContent>

        <TabsContent value="sub-tracks">
          <SimpleTab
            label="Sub Track"
            items={subTracks}
            loading={loading}
            onAdd={stAdd}
            onEdit={stEdit}
            onDelete={async (id) => stDelete(id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
