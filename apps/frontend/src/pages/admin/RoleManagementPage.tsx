import { CheckCircle2, XCircle } from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

const permissions: { label: string; admin: boolean; hrbp: boolean }[] = [
  { label: "View requests",            admin: true,  hrbp: true  },
  { label: "Create/edit requests",     admin: true,  hrbp: true  },
  { label: "View candidates",          admin: true,  hrbp: true  },
  { label: "Create/edit candidates",   admin: true,  hrbp: true  },
  { label: "Match candidates",         admin: true,  hrbp: true  },
  { label: "Update pipeline results",  admin: true,  hrbp: true  },
  { label: "Archive candidates",       admin: true,  hrbp: false },
  { label: "View activity log",        admin: true,  hrbp: true  },
  { label: "Access Admin Center",      admin: true,  hrbp: false },
  { label: "Manage users",             admin: true,  hrbp: false },
  { label: "Manage ATS configuration", admin: true,  hrbp: false },
]

function PermCell({ granted }: { granted: boolean }) {
  return granted
    ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    : <XCircle     className="h-4 w-4 text-muted-foreground/40" />
}

export default function RoleManagementPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Role Management</h1>
        <p className="text-sm text-muted-foreground">System roles and their permissions</p>
      </div>

      <p className="text-sm text-muted-foreground">
        2 roles · permissions are enforced by the system
      </p>

      <div className="rounded-md border max-w-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-full">Permission</TableHead>
              <TableHead className="text-center w-24">Admin</TableHead>
              <TableHead className="text-center w-24">HRBP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((p) => (
              <TableRow key={p.label}>
                <TableCell>{p.label}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <PermCell granted={p.admin} />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <PermCell granted={p.hrbp} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground max-w-lg">
        Roles are assigned per user in User Management.
        Contact system admin to change a user&apos;s role.
      </p>
    </div>
  )
}
