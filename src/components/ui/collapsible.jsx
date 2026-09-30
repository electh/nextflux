"use client";

import { cn } from "@/lib/utils";
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import * as React from "react";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.Trigger;

const CollapsibleContent = React.forwardRef(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Panel
    ref={ref}
    className={cn(
      "h-(--collapsible-panel-height) overflow-hidden transition-[height,opacity] duration-200 data-starting-style:h-0 data-starting-style:opacity-0 data-ending-style:h-0 data-ending-style:opacity-0 motion-reduce:transition-none",
      className,
    )}
    {...props}
  />
));

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
