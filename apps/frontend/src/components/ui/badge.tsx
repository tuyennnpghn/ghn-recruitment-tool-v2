import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border text-xs font-medium px-2.5 py-1 transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-emerald-50 text-emerald-800 border-emerald-200",
        warning:     "bg-amber-50 text-amber-800 border-amber-200",
        destructive: "bg-red-50 text-red-700 border-red-200",
        info:        "bg-sky-50 text-[#006FAD] border-sky-200",
        secondary:   "bg-slate-50 text-slate-600 border-slate-200",
        outline:     "border-slate-300 text-slate-700 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

export function BadgeDot({ className }: { className?: string }) {
  return (
    <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", className)} />
  )
}
