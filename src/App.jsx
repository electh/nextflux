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
import Settings from "@/components/Settings/Settings.jsx";
import Shortcuts from "@/components/Settings/Shortcuts.jsx";
import AI from "@/components/Settings/AI.jsx";
import AddFeedModal from "@/components/FeedList/components/AddFeedModal.jsx";
import AddCategoryModal from "@/components/FeedList/components/AddCategoryModal.jsx";
import { useHotkeys } from "@/hooks/useHotkeys.js";
import LogoutModal from "@/components/FeedList/components/LogoutModal.jsx";
import AboutModal from "@/components/About/AboutModal.jsx";
import RenameModal from "@/components/ArticleList/components/RenameModal.jsx";
import UnsubscribeModal from "@/components/ArticleList/components/UnsubscribeModal.jsx";
import EditFeedModal from "@/components/ArticleList/components/EditFeedModal.jsx";
import { checkIntegrations } from "@/stores/basicInfoStore.js";
import SearchModal from "@/components/Search/SearchModal.jsx";
import { useZoom } from "@/hooks/useZoom.js";
import { useBorderRadius } from "@/hooks/useBorderRadius.js";
import {
  shortcutsModalOpen,
  settingsModalOpen,
  addFeedModalOpen,
  addCategoryModalOpen,
  logoutModalOpen,
  aboutModalOpen,
  renameModalOpen,
  unsubscribeModalOpen,
  editFeedModalOpen,
  searchDialogOpen,
  aiModalOpen,
} from "@/stores/modalStore.js";

function App() {
  const { syncInterval } = useStore(settingsState);
  const $isSettingsOpen = useStore(settingsModalOpen);
  const $isShortcutsOpen = useStore(shortcutsModalOpen);
  const $isAddFeedOpen = useStore(addFeedModalOpen);
  const $isAddCategoryOpen = useStore(addCategoryModalOpen);
  const $isLogoutOpen = useStore(logoutModalOpen);
  const $isAboutOpen = useStore(aboutModalOpen);
  const $isRenameOpen = useStore(renameModalOpen);
  const $isUnsubscribeOpen = useStore(unsubscribeModalOpen);
  const $isEditFeedOpen = useStore(editFeedModalOpen);
  const $isSearchDialogOpen = useStore(searchDialogOpen);
  const $isAIOpen = useStore(aiModalOpen);
  useEffect(() => {
    // 检查认证状态并启动自动同步
    const auth = authState.get();
    if (auth.username) {
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
  return (
    <SidebarProvider>
      <FeedListSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
      {$isSettingsOpen && <Settings />}
      {$isShortcutsOpen && <Shortcuts />}
      {$isAddFeedOpen && <AddFeedModal />}
      {$isAddCategoryOpen && <AddCategoryModal />}
      {$isLogoutOpen && <LogoutModal />}
      {$isAboutOpen && <AboutModal />}
      {$isRenameOpen && <RenameModal />}
      {$isUnsubscribeOpen && <UnsubscribeModal />}
      {$isEditFeedOpen && <EditFeedModal />}
      {$isSearchDialogOpen && <SearchModal />}
      {$isAIOpen && <AI />}
    </SidebarProvider>
  );
}

export default App;
