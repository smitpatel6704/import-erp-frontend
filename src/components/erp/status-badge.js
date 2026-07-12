"use client";

import { cn } from "@/lib/utils";

const statusStyles = {
  draft: "bg-neutral/8 text-neutral border-neutral/20",
  booking_confirmed: "bg-info/10 text-info border-info/20",
  at_pol: "bg-warning/12 text-warning border-warning/20",
  vessel_departed: "bg-info/10 text-info border-info/20",
  in_transit: "bg-info/10 text-info border-info/20",
  at_pod: "bg-purple/10 text-purple border-purple/20",
  customs_clearance: "bg-warning/12 text-warning border-warning/20",
  duty_paid: "bg-success/10 text-success border-success/20",
  in_transport: "bg-info/10 text-info border-info/20",
  offloaded: "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-success/10 text-success border-success/20",
  closed: "bg-neutral/8 text-neutral border-neutral/20",

  // Success variants
  verified: "bg-success/10 text-success border-success/20",
  approved: "bg-success/10 text-success border-success/20",
  active: "bg-success/10 text-success border-success/20",
  completed: "bg-success/10 text-success border-success/20",
  paid: "bg-success/10 text-success border-success/20",

  // Warning variants
  pending: "bg-warning/12 text-warning border-warning/20",
  expired: "bg-danger/10 text-danger border-danger/20",
  rejected: "bg-danger/10 text-danger border-danger/20",
  suspended: "bg-danger/10 text-danger border-danger/20",
  cancelled: "bg-neutral/8 text-neutral border-neutral/20",
  missing: "bg-danger/10 text-danger border-danger/20",
  failed: "bg-danger/10 text-danger border-danger/20",

  // Info variants
  uploaded: "bg-info/10 text-info border-info/20",
  in_review: "bg-warning/12 text-warning border-warning/20",
  invited: "bg-info/10 text-info border-info/20",

  // Status
  urgent: "bg-danger/10 text-danger border-danger/20",
  high: "bg-warning/12 text-warning border-warning/20",
  normal: "bg-info/8 text-info border-info/15",
  low: "bg-neutral/8 text-neutral border-neutral/20",
};

const dotStyles = {
  draft: "bg-neutral",
  booking_confirmed: "bg-info",
  at_pol: "bg-warning",
  vessel_departed: "bg-info",
  in_transit: "bg-info",
  at_pod: "bg-purple",
  customs_clearance: "bg-warning",
  duty_paid: "bg-success",
  in_transport: "bg-info",
  offloaded: "bg-teal",
  delivered: "bg-success",
  closed: "bg-neutral",
  verified: "bg-success",
  approved: "bg-success",
  active: "bg-success",
  completed: "bg-success",
  paid: "bg-success",
  pending: "bg-warning",
  expired: "bg-danger",
  rejected: "bg-danger",
  suspended: "bg-danger",
  cancelled: "bg-neutral",
  missing: "bg-danger",
  failed: "bg-danger",
  uploaded: "bg-info",
  in_review: "bg-warning",
  invited: "bg-info",
  urgent: "bg-danger",
  high: "bg-warning",
  normal: "bg-info",
  low: "bg-neutral",
};

export function StatusBadge({ status, children, className, dot = true, ...props }) {
  const key = status?.toLowerCase().replace(/\s+/g, "_");
  const style = statusStyles[key] || "bg-muted text-muted-foreground border-border";
  const dotStyle = dotStyles[key] || "bg-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        style,
        className
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotStyle)} />}
      {children || status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
    </span>
  );
}

export function PriorityBadge({ priority, className, ...props }) {
  const key = priority?.toLowerCase();
  const style = statusStyles[key] || "bg-neutral/8 text-neutral border-neutral/20";
  const dotStyle = dotStyles[key] || "bg-neutral";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs font-medium capitalize",
        style,
        className
      )}
      {...props}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotStyle)} />
      {priority || "Normal"}
    </span>
  );
}
