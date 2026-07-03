"use client";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

function Switch({ className, ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent p-0.5 shadow-inner cursor-pointer",
        "transition-all duration-200 outline-none",
        "data-[state=unchecked]:bg-muted-foreground/25 dark:data-[state=unchecked]:bg-white/[0.08]",
        "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-teal data-[state=checked]:to-teal-dark data-[state=checked]:shadow-md",
        "focus-visible:ring-4 focus-visible:ring-teal/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-white shadow-md ring-0",
          "transition-transform duration-200 ease-out",
          "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
