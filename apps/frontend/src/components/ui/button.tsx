import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-[#FF5200] text-white hover:bg-orange-600 active:bg-orange-700 font-semibold tracking-[0.01em] transition-colors",
        secondary:
          "bg-white border-[1.5px] border-[#006FAD] text-[#006FAD] hover:bg-[#E8F4FB] active:bg-blue-100 font-medium transition-colors",
        outline:
          "bg-transparent border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium transition-colors",
        ghost:
          "hover:bg-slate-100 text-slate-600 font-medium border-none",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link:
          "text-[#006FAD] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default:   "h-9 px-4 py-2 text-sm rounded-[7px]",
        sm:        "h-8 px-3 text-xs rounded-[7px]",
        lg:        "h-10 px-6 text-sm rounded-[7px]",
        icon:      "h-9 w-9 rounded-[7px]",
        "icon-sm": "h-7 w-7 rounded-[6px]",
        "icon-lg": "h-10 w-10 rounded-[7px]",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
