import { cn } from "@/lib/utils";

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-border/70 bg-white/60 dark:bg-white/[0.04] px-3 py-2 text-sm shadow-sm backdrop-blur-sm",
        "transition-all duration-200 outline-none",
        "text-foreground placeholder:text-muted-foreground/70",
        "hover:border-border",
        "focus-visible:border-teal/50 focus-visible:ring-4 focus-visible:ring-teal/15 focus-visible:bg-white/85 dark:focus-visible:bg-white/[0.06]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
