import { cn } from "@workspace/ui/lib/utils"

export function PageLayout({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("flex min-h-svh flex-col gap-4 py-4", className)}>
      {children}
    </div>
  )
}
