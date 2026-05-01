import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 text-sm font-bold whitespace-nowrap transition-all outline-none active:scale-95 duration-200 disabled:pointer-events-none disabled:opacity-50 font-display uppercase tracking-wider [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90",
        brand:
          "bg-[#e63b2e] text-white hover:bg-[#d1332a]",
        gradient:
          "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:from-indigo-500 hover:to-violet-500",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "border border-neutral-800 bg-transparent text-foreground hover:bg-neutral-800 transition-colors",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-neutral-800 text-neutral-400 hover:text-white",
        link: "text-accent underline-offset-4 hover:underline",
        success:
          "bg-primary text-primary-foreground hover:opacity-90",
        warning:
          "bg-[#e63b2e] text-white hover:bg-[#d1332a]",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-6 gap-1 px-2 text-xs",
        sm: "h-8 gap-1.5 px-3",
        lg: "h-12 px-8 py-4 text-base",
        icon: "size-9",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
