import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useStore } from "@nanostores/react";
import { forceSync, isOnline, isSyncing } from "@/stores/syncStore.js";
import { RefreshCw } from "lucide-react";
import { reportError } from "@/lib/errors.js";
const SyncButton = () => {
  const $isOnline = useStore(isOnline);
  const $isSyncing = useStore(isSyncing);
  const handleForceSync = async () => {
    try {
      await forceSync();
    } catch (err) {
      reportError(err, "sync.force");
    }
  };
  return (
    <Button
      variant="ghost"
      onClick={handleForceSync}
      disabled={$isSyncing || !$isOnline || $isSyncing}
      aria-busy={$isSyncing}
      size="icon-sm"
    >
      {$isSyncing ? (
        <Spinner />
      ) : (
        <RefreshCw className="size-4 text-muted-foreground" />
      )}
    </Button>
  );
};
export default SyncButton;
