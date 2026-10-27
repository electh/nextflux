import { Outlet } from "react-router-dom";
import "./App.css";
import "m3-ripple/ripple.css";
import { lazy, Suspense, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar.jsx";
import { authState } from "@/stores/authStore.js";
import { startAutoSync, stopAutoSync } from "@/stores/syncStore.js";
import { settingsState } from "@/stores/settingsStore.js";
import { useStore } from "@nanostores/react";
import SettingsModal from "@/components/Settings/Settings.jsx";
import AddFeedModal from "@/components/FeedList/components/AddFeedModal.jsx";
import AddCategoryModal from "@/components/FeedList/components/AddCategoryModal.jsx";
import { useHotkeys } from "@/hooks/useHotkeys.js";
import AddAccountModal from "@/components/FeedList/components/AddAccountModal.jsx";
import LogoutModal from "@/components/FeedList/components/LogoutModal.jsx";
import RenameModal from "@/components/ArticleList/components/RenameModal.jsx";
import UnsubscribeModal from "@/components/ArticleList/components/UnsubscribeModal.jsx";
import EditFeedModal from "@/components/ArticleList/components/EditFeedModal.jsx";
import { checkIntegrations } from "@/stores/basicInfoStore.js";
import SearchModal from "@/components/Search/SearchModal.jsx";
import { useZoom } from "@/hooks/useZoom.js";
import { useFontLoader } from "@/hooks/useFontLoader.js";
import { useApplyReducedMotionPreference } from "@/hooks/useReducedMotion.js";

const GlobalAudioPlayer = lazy(
  () => import("@/components/GlobalAudio/GlobalAudioPlayer.jsx"),
);

// Store changes used by global effects should not rerender the application shell.
function AppEffects() {
  const { syncInterval } = useStore(settingsState);
  useEffect(() => {
    // 检查认证状态并启动自动同步
    const auth = authState.get();
    if (auth.username) {
      startAutoSync();
    }
    return stopAutoSync;
  }, [syncInterval]);
  // 检查第三方集成状态
  useEffect(() => {
    if (navigator.onLine) checkIntegrations();
    // Ask the browser to retain downloaded articles where supported.
    navigator.storage?.persist?.().catch(() => {});
  }, []);

  useHotkeys();
  useZoom();
  useFontLoader(); // 按需加载字体
  useApplyReducedMotionPreference();
  return null;
}

function App() {
  return (
    <SidebarProvider className="bg-sidebar">
      <AppEffects />
      <Outlet />
      <SettingsModal />
      <AddFeedModal />
      <AddCategoryModal />
      <LogoutModal />
      <AddAccountModal />
      <RenameModal />
      <UnsubscribeModal />
      <EditFeedModal />
      <SearchModal />
      <Suspense fallback={null}>
        <GlobalAudioPlayer />
      </Suspense>
    </SidebarProvider>
  );
}

export default App;
