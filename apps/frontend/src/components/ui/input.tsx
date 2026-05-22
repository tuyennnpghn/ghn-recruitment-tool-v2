import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-[7px] border-[1.5px] border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus-visible:outline-none focus-visible:border-[#009BE0] focus-visible:ring-[3px] focus-visible:ring-[#009BE0]/10 aria-invalid:border-red-400 aria-invalid:ring-[3px] aria-invalid:ring-red-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 md:text-sm",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
