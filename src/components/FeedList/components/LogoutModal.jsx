import CustomAlertDialog from "@/components/ui/CustomAlertDialog.jsx";
import { useTranslation } from "react-i18next";
import { logoutModalOpen } from "@/stores/modalStore.js";
import { useStore } from "@nanostores/react";
import { logout } from "@/stores/authStore.js";
import { reportError } from "@/lib/errors.js";
import { toast } from "sonner";

export default function LogoutModal() {
  const { t } = useTranslation();
  const $logoutModalOpen = useStore(logoutModalOpen);
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error(t("auth.logoutFailed"));
      throw reportError(error, "auth.logoutModal");
    }
  };
  return (
    <CustomAlertDialog
      title={t("sidebar.profile.logout")}
      content={t("sidebar.profile.logoutConfirmDescription")}
      isOpen={$logoutModalOpen}
      onConfirm={handleLogout}
      onClose={() => logoutModalOpen.set(false)}
      confirmText={t("sidebar.profile.logout")}
      cancelText={t("common.cancel")}
    />
  );
}
