import { useIsMobile } from "@/hooks/use-mobile.jsx";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
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
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-3 right-3"
                />
              }
            >
              <X />
              <span className="sr-only">Close</span>
            </DrawerClose>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer && (
            <DrawerFooter className="grid grid-flow-col auto-cols-fr border-t p-4 pb-safe-or-4">
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
          <DialogFooter className="m-0 grid grid-flow-col auto-cols-fr rounded-none border-t p-4">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
