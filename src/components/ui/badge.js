import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center gap-1 rounded-full border px-2 py-0.5",
    "text-[10.5px] font-semibold uppercase tracking-wider w-fit whitespace-nowrap shrink-0",
    "[&>svg]:size-3 [&>svg]:pointer-events-none",
    "transition-colors duration-200 overflow-hidden",
    "focus-visible:ring-2 focus-visible:ring-ring/40",
    "aria-invalid:ring-destructive/25 aria-invalid:border-destructive",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/12 text-primary [a&]:hover:bg-primary/18",
        secondary:
          "border-border/70 bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80",
        destructive:
          "border-destructive/25 bg-destructive/12 text-destructive [a&]:hover:bg-destructive/18",
        outline:
          "border-border/70 bg-transparent text-foreground [a&]:hover:bg-accent/50",
        success:
          "border-success/25 bg-success/12 text-success [a&]:hover:bg-success/18",
        warning:
          "border-warning/30 bg-warning/15 text-amber-dark dark:text-amber-light [a&]:hover:bg-warning/22",
        info:
          "border-info/25 bg-info/12 text-info [a&]:hover:bg-info/18",
        teal:
          "border-teal/25 bg-teal/12 text-teal [a&]:hover:bg-teal/18",
        solid:
          "border-transparent bg-gradient-to-b from-primary to-primary/90 text-primary-foreground shadow-sm [a&]:hover:brightness-105",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
