import { cn } from "@/lib/utils";

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-lg border border-border/70 bg-white/60 dark:bg-white/[0.04] px-3 py-1 text-sm shadow-sm backdrop-blur-sm",
        "transition-all duration-200 outline-none",
        "text-foreground placeholder:text-muted-foreground/70",
        "selection:bg-primary/20 selection:text-primary",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "hover:border-border",
        "focus-visible:border-teal/50 focus-visible:ring-4 focus-visible:ring-teal/15 focus-visible:bg-white/85 dark:focus-visible:bg-white/[0.06]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15",
        className
      )}
      {...props}
    />
  );
}

export { Input };
