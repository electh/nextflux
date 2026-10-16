import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { LOGOUT_NOTICE_KEY } from "@/services/accountCleanup.js";

export default function SessionNotices() {
  const { t } = useTranslation();
  useEffect(() => {
    try {
      if (!sessionStorage.getItem(LOGOUT_NOTICE_KEY)) return;
      sessionStorage.removeItem(LOGOUT_NOTICE_KEY);
      toast.warning(t("auth.logoutCleanupWarning"), { duration: 15_000 });
    } catch {
      /* Notices must not prevent loading the login screen. */
    }
  }, [t]);
  return null;
}
