import "./morph-dropdown-menu.css";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion.js";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Overlap the anchor so the menu surface grows directly out of its button.
function overlapAnchor({ side, anchor }) {
  return -(side === "top" || side === "bottom" ? anchor.height : anchor.width);
}

function MorphDropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = overlapAnchor,
  className,
  children,
  ...props
}) {
  const reduceMotion = useReducedMotion();

  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="morph-menu-positioner isolate z-50 outline-none before:shadow-custom-md"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="morph-dropdown-menu-content"
          data-reduced-motion={reduceMotion}
          className={cn(
            "morph-menu-popup max-h-(--available-height) w-(--anchor-width) min-w-48 overflow-x-hidden overflow-y-auto rounded-xl bg-popover/80 backdrop-blur-[24px] p-1.5 text-popover-foreground outline-none",
            className,
          )}
          {...props}
        >
          <div className="morph-menu-items">{children}</div>
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

export {
  DropdownMenu as MorphDropdownMenu,
  DropdownMenuTrigger as MorphDropdownMenuTrigger,
  DropdownMenuGroup as MorphDropdownMenuGroup,
  DropdownMenuItem as MorphDropdownMenuItem,
  MorphDropdownMenuContent,
};
