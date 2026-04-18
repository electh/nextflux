import { useIsMobile } from "@/hooks/use-mobile.jsx";
import { Drawer, Modal, cn, Button } from "@heroui/react";

export default function CustomModal({
  open,
  onOpenChange,
  title,
  fixedHeight = false,
  children,
  footer,
}) {
  const { isMedium } = useIsMobile();
  if (isMedium) {
    return (
      <Drawer>
        <Button className="hidden" />
        <Drawer.Backdrop isOpen={open} onOpenChange={onOpenChange}>
          <Drawer.Content>
            <Drawer.Dialog className={cn("px-0 pb-0", fixedHeight && "h-4/5")}>
              <Drawer.Handle />
              <Drawer.CloseTrigger />
              <Drawer.Header className="p-3">
                <Drawer.Heading>{title}</Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body className="m-0 p-0">{children}</Drawer.Body>
              {footer && (
                <Drawer.Footer className="bg-background dark:bg-transparent border-t p-4 m-0">
                  {footer}
                </Drawer.Footer>
              )}
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    );
  }
  return (
    <Modal>
      <Button className="hidden" />
      <Modal.Backdrop isOpen={open} onOpenChange={onOpenChange}>
        <Modal.Container>
          <Modal.Dialog className={cn("p-0", fixedHeight && "h-2/3")}>
            <Modal.Header>
              <Modal.Heading className="p-3">{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="m-0 p-0">{children}</Modal.Body>
            {footer && (
              <Modal.Footer className="bg-background dark:bg-transparent border-t p-4 m-0">
                {footer}
              </Modal.Footer>
            )}
            <Modal.CloseTrigger />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
