import { Navigate, useLocation } from "react-router-dom";
import { useStore } from "@nanostores/react";
import { authState, sessionEnding } from "@/stores/authStore";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "react-i18next";

export default function AuthGuard({ children }) {
  const auth = useStore(authState);
  const ending = useStore(sessionEnding);
  const { t } = useTranslation();
  const location = useLocation();

  if (ending) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <Spinner aria-label={t("common.loading")} />
      </div>
    );
  }

  // 检查是否已认证 - 需要有服务器地址,并且有用户名密码或token其中之一
  const isAuthenticated =
    auth.serverUrl &&
    ((auth.username && auth.password) ||
      (auth.authType === "token" && auth.token));

  if (!isAuthenticated) {
    // 如果未认证,重定向到登录页面,并记录原始访问路径
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
