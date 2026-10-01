import { useIsMobile } from "@/hooks/use-mobile.jsx";
import { cn } from "@/lib/utils";
import { CloseButton } from "@/components/ui/close-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

export default function CustomModal({
  open,
  onOpenChange,
  title,
  fixedHeight = false,
  children,
  footer,
}) {
  const { isMedium } = useIsMobile();
  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) onOpenChange(false);
  };
  if (isMedium) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange} showSwipeHandle>
        <DrawerContent
          className={cn("max-h-[85dvh]", fixedHeight && "h-[80dvh]")}
        >
          <DrawerHeader className="px-4 pb-4 text-left">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerClose
              render={<CloseButton className="absolute top-3 right-3" />}
            />
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer && (
            <DrawerFooter className="grid min-w-0 grid-flow-col auto-cols-fr [&>button]:min-w-0 [&>button]:h-auto [&>button]:min-h-9 [&>button]:whitespace-normal border-t p-4 pb-safe-or-4">
              {footer}
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
          fixedHeight && "h-[66dvh]",
        )}
      >
        <DialogHeader className="p-4">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && (
          <DialogFooter className="m-0 grid min-w-0 grid-flow-col auto-cols-fr [&>button]:min-w-0 [&>button]:h-auto [&>button]:min-h-9 [&>button]:whitespace-normal rounded-none border-t p-4">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
