import { cn } from "@/lib/utils";

/** Shared glass material; children keep their own interaction and focus styles. */
function LiquidGlass({ className, children, ...props }) {
  return (
    <div
      data-slot="liquid-glass"
      className={cn(
        "liquid-glass relative inline-flex shrink-0 items-center rounded-full",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { LiquidGlass };
