import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HrbpShareSelect, hrbpList, avatarColors } from "@/components/new-request-drawer"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

/* ------------------------------------------------------------------ */
/*  ShareRequestDrawer — reusable component                            */
/* ------------------------------------------------------------------ */

export function ShareRequestDrawer({
  open,
  onOpenChange,
  requestNo,
  existingShares = [],
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestNo: string
  existingShares?: { name: string; initials: string; sharedDate: string }[]
}) {
  const [selected, setSelected] = useState<{ name: string; initials: string }[]>(
    existingShares.map((s) => ({ name: s.name, initials: s.initials }))
  )

  const handleAdd = (hrbp: { name: string; initials: string }) => {
    if (selected.length < 3 && !selected.some((h) => h.name === hrbp.name)) {
      setSelected([...selected, hrbp])
    }
  }
  const handleRemove = (name: string) => {
    setSelected(selected.filter((h) => h.name !== name))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-none sm:w-[340px] p-0 flex flex-col overflow-hidden"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
          <SheetTitle className="text-base">Share Request</SheetTitle>
          <SheetDescription className="text-xs">
            Share <span className="font-mono font-medium text-foreground">{requestNo}</span> with up to 3 HRBPs
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-5 py-4 space-y-4">
            {/* Existing shares preview */}
            {existingShares.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Currently shared</p>
                {existingShares.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2.5 text-xs">
                    <Avatar className="size-5">
                      <AvatarFallback className={`${avatarColors[i % avatarColors.length]} text-[8px] font-semibold`}>
                        {s.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{s.name}</span>
                    <span className="text-muted-foreground ml-auto">{s.sharedDate}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Selector */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Add HRBP</p>
              <HrbpShareSelect
                selected={selected}
                onSelect={handleAdd}
                onRemove={handleRemove}
              />
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
