import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium",
    "transition-all duration-200 ease-out",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1",
    "aria-invalid:ring-destructive/25 aria-invalid:border-destructive",
    "active:scale-[0.97]",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-primary to-primary/90 text-primary-foreground shadow-sm hover:shadow-md hover:brightness-105",
        destructive:
          "bg-gradient-to-b from-destructive to-destructive/90 text-white shadow-sm hover:shadow-md hover:brightness-105 focus-visible:ring-destructive/40",
        outline:
          "border border-border/70 bg-background/60 backdrop-blur-sm shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-teal/30 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost:
          "hover:bg-accent/70 hover:text-accent-foreground dark:hover:bg-white/[0.06]",
        link: "text-primary underline-offset-4 hover:underline",
        glass:
          "bg-white/55 dark:bg-white/[0.06] backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm hover:bg-white/70 dark:hover:bg-white/[0.09] text-foreground",
        teal:
          "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-sm hover:shadow-md hover:brightness-110",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-10 rounded-lg px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-xl px-8 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
