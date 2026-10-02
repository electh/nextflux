import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import CustomAlertDialog from "@/components/ui/CustomAlertDialog";
import { settingsState, updateSettings } from "@/stores/settingsStore";
import { themeState, setTheme } from "@/stores/themeStore";
import { isOnline } from "@/stores/syncStore";
import { useStore } from "@nanostores/react";
import { exportOPML } from "@/api/resources/feeds";
import {
  createSettingsBackup,
  parseSettingsBackup,
  MAX_BACKUP_BYTES,
} from "@/domain/preferences/settingsBackup";
import { datedFilename, downloadFile } from "@/lib/download";
import { reportError } from "@/lib/errors";

export default function Backup() {
  const { t, i18n } = useTranslation();
  const online = useStore(isOnline);
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(null);
  const [pending, setPending] = useState(null);
  const [filename, setFilename] = useState("");
  const key = (name) => `settings.backup.${name}`;

  const exportSubscriptions = async () => {
    setBusy("opml");
    try {
      downloadFile(
        await exportOPML(),
        datedFilename("subscriptions", "opml"),
        "application/xml;charset=utf-8",
      );
      toast.success(t(key("exportSuccess")));
    } catch (error) {
      reportError(error, "backup.exportOpml");
      toast.error(t(key("exportFailed")));
    } finally {
      setBusy(null);
    }
  };

  const exportSettings = () => {
    try {
      const backup = createSettingsBackup({
        settings: settingsState.get(),
        theme: themeState.get(),
        language: i18n.resolvedLanguage || i18n.language,
      });
      downloadFile(
        JSON.stringify(backup, null, 2),
        datedFilename("settings", "json"),
        "application/json;charset=utf-8",
      );
      toast.success(t(key("exportSuccess")));
    } catch (error) {
      reportError(error, "backup.exportSettings");
      toast.error(t(key("exportFailed")));
    }
  };

  const readBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy("restore");
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error("fileTooLarge");
      const backup = parseSettingsBackup(await file.text());
      setFilename(file.name);
      setPending(backup);
    } catch (error) {
      const reason = ["fileTooLarge", "unsupportedVersion"].includes(
        error.message,
      )
        ? error.message
        : "invalidBackup";
      toast.error(t(key(reason)));
    } finally {
      setBusy(null);
    }
  };

  const restore = async () => {
    // The complete file has been validated before any preferences change.
    const previous = {
      settings: settingsState.get(),
      theme: themeState.get(),
      language: i18n.language,
    };
    try {
      updateSettings(pending.settings);
      themeState.set(pending.theme);
      setTheme(pending.theme.themeMode);
      await i18n.changeLanguage(pending.language);
      toast.success(t(key("restoreSuccess")));
    } catch (error) {
      settingsState.set(previous.settings);
      themeState.set(previous.theme);
      setTheme(previous.theme.themeMode);
      await i18n.changeLanguage(previous.language);
      toast.error(t(key("restoreFailed")));
      throw error;
    }
  };

  return (
    <>
      <section
        className="flex flex-col gap-4 pt-3"
        aria-labelledby="backup-subscriptions-title"
      >
        <div className="flex flex-col gap-1.5">
          <h3 id="backup-subscriptions-title" className="text-sm font-semibold">
            {t(key("subscriptions"))}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t(key("opmlDescription"))}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="self-start"
          disabled={!online || !!busy || !!pending}
          aria-busy={busy === "opml"}
          onClick={exportSubscriptions}
        >
          {busy === "opml" ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Download data-icon="inline-start" />
          )}
          {t(key("exportOpml"))}
        </Button>
        {!online && (
          <p className="text-sm text-muted-foreground">
            {t(key("requiresConnection"))}
          </p>
        )}
      </section>
      <Separator className="my-2" />
      <section
        className="flex flex-col gap-4"
        aria-labelledby="backup-preferences-title"
      >
        <div className="flex flex-col gap-1.5">
          <h3 id="backup-preferences-title" className="text-sm font-semibold">
            {t(key("preferences"))}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t(key("settingsDescription"))}
          </p>
        </div>
        <div className="flex flex-col items-start min-[769px]:flex-row min-[769px]:flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={exportSettings}
            disabled={!!busy || !!pending}
          >
            <Download data-icon="inline-start" />
            {t(key("exportSettings"))}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={!!busy || !!pending}
            aria-busy={busy === "restore"}
          >
            {busy === "restore" ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <RotateCcw data-icon="inline-start" />
            )}
            {t(key("restoreSettings"))}
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          aria-label={t(key("restoreSettings"))}
          className="hidden"
          onChange={readBackup}
        />
      </section>
      <Separator className="my-2" />
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t(key("migrationDescription"))}{" "}
        <a
          href="https://miniflux.app/faq.html#backup"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-primary underline underline-offset-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t(key("backupGuide"))}
        </a>
      </p>
      <CustomAlertDialog
        isOpen={!!pending}
        title={t(key("restoreSettings"))}
        content={t(key("restoreConfirm"), { filename })}
        onConfirm={restore}
        onClose={() => setPending(null)}
        cancelText={t("common.cancel")}
        confirmText={t(key("restoreSettings"))}
      />
    </>
  );
}
