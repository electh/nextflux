import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";

export default function PwaUpdates() {
  const { t } = useTranslation();
  const [registration, setRegistration] = useState(null);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, value) {
      setRegistration(value);
    },
    onOfflineReady() {
      toast.success(
        "Offline launch is ready. Sync your articles before disconnecting.",
      );
    },
    onRegisterError(error) {
      console.error("PWA registration failed", error);
    },
  });

  useEffect(() => {
    if (!registration) return;
    const check = () => {
      if (navigator.onLine && document.visibilityState === "visible") {
        registration.update().catch((error) => {
          console.debug("PWA update check failed", error);
        });
      }
    };
    const interval = window.setInterval(check, 60 * 60 * 1000);
    window.addEventListener("online", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("online", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [registration]);

  useEffect(() => {
    if (!needRefresh) return;
    const id = toast(t("pwa.updateAvailable"), {
      id: "pwa-update",
      duration: Infinity,
      action: {
        label: t("pwa.reload"),
        onClick: () => {
          updateServiceWorker(true).catch(() => {
            toast.error(t("pwa.updateFailed"));
          });
        },
      },
      cancel: {
        label: t("pwa.later"),
        onClick: () => setNeedRefresh(false),
      },
    });
    return () => toast.dismiss(id);
  }, [needRefresh, setNeedRefresh, updateServiceWorker, t]);

  return null;
}
