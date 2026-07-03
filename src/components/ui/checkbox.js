"use client";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[5px] border border-border/70 bg-white/60 dark:bg-white/[0.04] shadow-sm backdrop-blur-sm",
        "transition-all duration-200 outline-none cursor-pointer",
        "hover:border-teal/40",
        "data-[state=checked]:bg-teal data-[state=checked]:border-teal data-[state=checked]:text-white data-[state=checked]:shadow-md",
        "data-[state=indeterminate]:bg-teal data-[state=indeterminate]:border-teal data-[state=indeterminate]:text-white",
        "focus-visible:ring-4 focus-visible:ring-teal/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current data-[state=checked]:animate-in data-[state=checked]:zoom-in-50 data-[state=checked]:duration-150"
      >
        <CheckIcon className="size-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
