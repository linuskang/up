import * as React from "react"

import { cn } from "#lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "h-7 w-full min-w-0 rounded-md border border-border bg-input px-2 py-0.5 text-sm outline-none",
                "transition-[box-shadow,border-color,background-color] duration-100 ease-out",
                "placeholder:font-semibold placeholder:text-muted-foreground",
                "focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "aria-invalid:focus-visible:ring-destructive/40",
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground",
                "dark:bg-input dark:aria-invalid:focus-visible:ring-destructive/60",
                className
            )}
            {...props}
        />
    )
}

export { Input }
