import { useState, useEffect } from "react"
import { Plus, Pencil, KeyRound, Trash2, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { adminService } from "@/lib/services"
import { toast } from "sonner"

interface AdminUser {
  id: string
  email: string
  fullName: string
  role: "admin" | "hrbp"
  isActive: boolean
  createdAt: string
}

type DialogMode = "add" | "edit" | "resetPwd" | "delete" | null

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [saving, setSaving] = useState(false)

  // Add / Edit form fields
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formRole, setFormRole] = useState<"admin" | "hrbp">("hrbp")
  const [formPassword, setFormPassword] = useState("")
  const [formActive, setFormActive] = useState(true)

  // Reset password fields
  const [newPwd, setNewPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const data = await adminService.listUsers() as AdminUser[]
      setUsers(data)
    } catch {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setFormName(""); setFormEmail(""); setFormPassword(""); setFormRole("hrbp"); setFormActive(true)
    setSelected(null)
    setDialogMode("add")
  }

  function openEdit(u: AdminUser) {
    setFormName(u.fullName); setFormEmail(u.email); setFormRole(u.role); setFormActive(u.isActive); setFormPassword("")
    setSelected(u)
    setDialogMode("edit")
  }

  function openResetPwd(u: AdminUser) {
    setNewPwd(""); setConfirmPwd("")
    setSelected(u)
    setDialogMode("resetPwd")
  }

  function openDelete(u: AdminUser) {
    setSelected(u)
    setDialogMode("delete")
  }

  function closeDialog() {
    setDialogMode(null)
    setSelected(null)
  }

  async function handleAdd() {
    if (!formName.trim() || !formEmail.trim() || !formPassword) {
      toast.error("All fields are required")
      return
    }
    if (formPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setSaving(true)
    try {
      await adminService.createUser({
        fullName: formName.trim(),
        email: formEmail.trim(),
        password: formPassword,
        role: formRole,
      })
      toast.success("User created")
      closeDialog()
      fetchUsers()
    } catch {
      toast.error("Failed to create user")
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit() {
    if (!selected) return
    setSaving(true)
    try {
      await adminService.updateUser(selected.id, {
        fullName: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        isActive: formActive,
      })
      toast.success("User updated")
      closeDialog()
      fetchUsers()
    } catch {
      toast.error("Failed to update user")
    } finally {
      setSaving(false)
    }
  }

  async function handleResetPwd() {
    if (!selected) return
    if (newPwd.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    if (newPwd !== confirmPwd) {
      toast.error("Passwords do not match")
      return
    }
    setSaving(true)
    try {
      await adminService.resetPassword(selected.id, newPwd)
      toast.success("Password reset successfully")
      closeDialog()
    } catch {
      toast.error("Failed to reset password")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!selected) return
    setSaving(true)
    try {
      await adminService.deleteUser(selected.id)
      toast.success("User deleted")
      closeDialog()
      fetchUsers()
    } catch {
      toast.error("Failed to delete user")
    } finally {
      setSaving(false)
    }
  }

  const filtered = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${users.length} user${users.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
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
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground text-sm">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow key={u.id} className={!u.isActive ? "opacity-50" : ""}>
                  <TableCell
                    className={!u.isActive ? "line-through text-muted-foreground" : "font-medium"}
                  >
                    {u.fullName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                      {u.role === "admin" ? "Admin" : "HRBP"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost" size="icon"
                        title="Edit"
                        onClick={() => openEdit(u)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        title="Reset Password"
                        onClick={() => openResetPwd(u)}
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        title="Delete"
                        onClick={() => openDelete(u)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit dialog */}
      <Dialog
        open={dialogMode === "add" || dialogMode === "edit"}
        onOpenChange={(open) => { if (!open) closeDialog() }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add User" : "Edit User"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "add" ? "Create a new user account." : `Editing ${selected?.fullName ?? ""}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="um-name">Full Name</Label>
              <Input
                id="um-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nguyen Van A"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="um-email">Email</Label>
              <Input
                id="um-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="user@ghn.vn"
              />
            </div>
            {dialogMode === "add" && (
              <div className="space-y-1">
                <Label htmlFor="um-password">Password</Label>
                <Input
                  id="um-password"
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Min 8 characters"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label>Role</Label>
              <Select value={formRole} onValueChange={(v) => setFormRole(v as "admin" | "hrbp")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hrbp">HRBP</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dialogMode === "edit" && (
              <div className="flex items-center gap-2 pt-1">
                <Switch id="um-active" checked={formActive} onCheckedChange={setFormActive} />
                <Label htmlFor="um-active">Active</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={dialogMode === "add" ? handleAdd : handleEdit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {dialogMode === "add" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password dialog */}
      <Dialog
        open={dialogMode === "resetPwd"}
        onOpenChange={(open) => { if (!open) closeDialog() }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for <strong>{selected?.fullName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="um-newpwd">New Password</Label>
              <Input
                id="um-newpwd"
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Min 8 characters"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="um-confirmpwd">Confirm Password</Label>
              <Input
                id="um-confirmpwd"
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Repeat password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleResetPwd} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog
        open={dialogMode === "delete"}
        onOpenChange={(open) => { if (!open) closeDialog() }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Delete <strong>{selected?.fullName}</strong>?{" "}
              If this user has existing records they will be deactivated instead of removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
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
