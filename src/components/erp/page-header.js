"use client";

import { cn } from "@/lib/utils";

export function PageHeader({
  icon: Icon,
  title,
  description,
  children,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
            <Icon className="h-4.5 w-4.5" strokeWidth={2} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex shrink-0 items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
