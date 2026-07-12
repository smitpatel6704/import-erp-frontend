"use client";

import { cn } from "@/lib/utils";

function SkeletonBlock({ className, ...props }) {
  return (
    <div
      className={cn("animate-shimmer rounded-lg", className)}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 6, cols = 6, className }) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-4 border-b border-border pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBlock key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonBlock
              key={j}
              className={cn("h-4 flex-1", j === 0 && "flex-[2]")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function KPISkeleton({ count = 4, className }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 shadow-xs">
          <SkeletonBlock className="mb-2 h-3 w-20" />
          <SkeletonBlock className="mb-2 h-7 w-28" />
          <SkeletonBlock className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className }) {
  return (
    <div className={cn("rounded-xl border bg-card p-5 shadow-xs", className)}>
      <SkeletonBlock className="mb-3 h-5 w-32" />
      <SkeletonBlock className="mb-2 h-4 w-full" />
      <SkeletonBlock className="h-4 w-3/4" />
    </div>
  );
}

export function PageSkeleton({ className }) {
  return (
    <div className={cn("space-y-6", className)}>
      <SkeletonBlock className="h-8 w-48" />
      <SkeletonBlock className="h-4 w-72" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 shadow-xs">
            <SkeletonBlock className="mb-2 h-3 w-20" />
            <SkeletonBlock className="mb-2 h-7 w-28" />
            <SkeletonBlock className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-xs">
        <SkeletonBlock className="mb-4 h-5 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} className="mb-3 h-4 w-full last:mb-0" />
        ))}
      </div>
    </div>
  );
}
