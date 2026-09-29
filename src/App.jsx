import { Outlet } from "react-router-dom";
import "./App.css";
import "m3-ripple/ripple.css";
import { useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar.jsx";
import FeedListSidebar from "@/components/FeedList/FeedListSidebar.jsx";
import { authState } from "@/stores/authStore.js";
import { startAutoSync } from "@/stores/syncStore.js";
import { settingsState } from "@/stores/settingsStore.js";
import { useStore } from "@nanostores/react";
import SettingsModal from "@/components/Settings/Settings.jsx";
import AddFeedModal from "@/components/FeedList/components/AddFeedModal.jsx";
import AddCategoryModal from "@/components/FeedList/components/AddCategoryModal.jsx";
import { useHotkeys } from "@/hooks/useHotkeys.js";
import LogoutModal from "@/components/FeedList/components/LogoutModal.jsx";
import RenameModal from "@/components/ArticleList/components/RenameModal.jsx";
import UnsubscribeModal from "@/components/ArticleList/components/UnsubscribeModal.jsx";
import EditFeedModal from "@/components/ArticleList/components/EditFeedModal.jsx";
import { checkIntegrations } from "@/stores/basicInfoStore.js";
import SearchModal from "@/components/Search/SearchModal.jsx";
import { useZoom } from "@/hooks/useZoom.js";
import { useBorderRadius } from "@/hooks/useBorderRadius.js";
import { useFontLoader } from "@/hooks/useFontLoader.js";

function App() {
  const { syncInterval } = useStore(settingsState);
  useEffect(() => {
    // 检查认证状态并启动自动同步
    const auth = authState.get();
    const isAuthenticated =
      auth.serverUrl &&
      ((auth.username && auth.password) ||
        (auth.authType === "token" && auth.token));
    if (isAuthenticated) {
      startAutoSync();
    }
  }, [syncInterval]);
  // 检查第三方集成状态
  useEffect(() => {
    checkIntegrations();
  }, []);

  useHotkeys();
  useZoom();
  useBorderRadius();
  useFontLoader(); // 按需加载字体
  return (
    <SidebarProvider>
      <FeedListSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
      <SettingsModal />
      <AddFeedModal />
      <AddCategoryModal />
      <LogoutModal />
      <RenameModal />
      <UnsubscribeModal />
      <EditFeedModal />
      <SearchModal />
    </SidebarProvider>
  );
}

export default App;
