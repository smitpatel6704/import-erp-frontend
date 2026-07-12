"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor,
  trend,
  href,
  className,
  compact,
  ...props
}) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const content = (
    <div
      className={cn(
        "group relative rounded-xl border bg-card p-4 shadow-xs transition-all hover:border-primary/20 hover:shadow-sm",
        compact ? "p-3" : "p-4",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className={cn("mt-1 font-semibold tracking-tight text-foreground", compact ? "text-xl" : "text-2xl")}>
            {value}
          </p>
          {(change !== undefined || changeLabel) && (
            <div className="mt-1 flex items-center gap-1.5">
              {change !== undefined && change !== 0 && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-medium",
                    isPositive && "text-success",
                    isNegative && "text-danger",
                    change === 0 && "text-muted-foreground"
                  )}
                >
                  <TrendIcon className="h-3 w-3" />
                  {isPositive ? "+" : ""}{change}%
                </span>
              )}
              {changeLabel && (
                <span className="text-xs text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1",
              iconColor || "text-primary bg-primary/8 ring-primary/15"
            )}
          >
            <Icon className="h-4.5 w-4.5" strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export function StatCardCompact({
  label,
  value,
  icon: Icon,
  color,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 shadow-xs",
        className
      )}
      {...props}
    >
      {Icon && (
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md ring-1",
            color || "text-primary bg-primary/8 ring-primary/15"
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
