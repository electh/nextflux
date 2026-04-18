import { Button, AlertDialog, Spinner } from "@heroui/react";
import { useState } from "react";

export default function CustomAlertDialog({
  title,
  content,
  isOpen,
  onConfirm,
  onClose,
  cancelText = "取消",
  confirmText = "确定",
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("确认操作失败:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <Button className="hidden" />
      <AlertDialog.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => !open && onClose()}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px] p-0">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header className="px-4 pt-4">
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body className="px-4">
              <p>{content}</p>
            </AlertDialog.Body>
            <AlertDialog.Footer className="bg-background dark:bg-transparent border-t p-4">
              <Button variant="tertiary" onPress={onClose}>
                {cancelText}
              </Button>
              <Button
                variant="danger"
                onPress={handleConfirm}
                isPending={loading}
              >
                {loading && <Spinner color="current" size="sm" />}
                {confirmText}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
