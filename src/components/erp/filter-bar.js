"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function FilterBar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  children,
  onToggleAdvanced,
  showAdvanced,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center",
        className
      )}
      {...props}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue || ""}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="h-9 pl-9 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        {children}
        {onToggleAdvanced && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleAdvanced}
            className={cn(
              "h-9 gap-1.5 text-sm",
              showAdvanced && "bg-accent text-accent-foreground"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </Button>
        )}
      </div>
    </div>
  );
}

export function ActiveFilterBadge({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border bg-accent/50 px-2 py-0.5 text-xs font-medium text-accent-foreground">
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-sm p-0.5 hover:bg-muted"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
