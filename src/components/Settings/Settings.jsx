import { CloseButton } from "@/components/ui/close-button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { settingsModalOpen } from "@/stores/modalStore.js";
import { useStore } from "@nanostores/react";
import General from "@/components/Settings/General.jsx";
import Appearance from "@/components/Settings/Appearance.jsx";
import Readability from "@/components/Settings/Readability.jsx";
import AI from "@/components/Settings/AI.jsx";
import About from "@/components/Settings/About.jsx";
import Shortcuts from "@/components/Settings/Shortcuts.jsx";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile.jsx";
import {
  Cog,
  Paintbrush,
  FileText,
  Sparkles,
  Keyboard,
  Info,
  ArrowLeft,
} from "lucide-react";
const menuItems = [
  {
    id: "general",
    icon: Cog,
    translationKey: "settings.general.title",
  },
  {
    id: "appearance",
    icon: Paintbrush,
    translationKey: "settings.appearance.title",
  },
  {
    id: "readability",
    icon: FileText,
    translationKey: "settings.readability.title",
  },
  {
    id: "ai",
    icon: Sparkles,
    translationKey: "settings.ai.title",
  },
  {
    id: "shortcuts",
    icon: Keyboard,
    translationKey: "sidebar.shortcuts.title",
  },
  {
    id: "about",
    icon: Info,
    translationKey: "about.title",
  },
];

// 移动设备菜单列表内容
function MenuList({ onSelect }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("general");
  const handleSelect = (id) => {
    setActiveTab(id);
    onSelect(id);
  };
  return (
    <div className="flex flex-col">
      <nav className="flex-1 overflow-y-auto p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              data-active={isActive}
              className={cn(
                "flex items-center text-foreground gap-3 w-full px-3 py-2 rounded-xl text-sm outline-hidden ring-primary transition-[width,height,padding] cursor-pointer",
                "hover:bg-secondary/60 hover:text-foreground focus-visible:ring-2",
                "data-[active=true]:bg-secondary data-[active=true]:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span>{t(item.translationKey)}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// 内容区域
function ContentArea({ activeTab, showTitle = false, className }) {
  const { t } = useTranslation();
  const currentMenuItem = menuItems.find((item) => item.id === activeTab);
  const renderContent = () => {
    // 没有选中任何 tab 时不渲染内容
    if (!activeTab) {
      return null;
    }
    switch (activeTab) {
      case "general":
        return <General />;
      case "appearance":
        return <Appearance />;
      case "readability":
        return <Readability />;
      case "ai":
        return <AI />;
      case "shortcuts":
        return <Shortcuts />;
      case "about":
        return <About />;
      default:
        return <General />;
    }
  };
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-popover md:shadow-custom md:rounded-2xl",
        className,
      )}
    >
      {showTitle && (
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-base font-medium">
            {t(currentMenuItem?.translationKey || "")}
          </h3>
        </div>
      )}
      <div
        className={cn(
          "overflow-y-auto",
          "settings-content flex-1 overflow-y-auto p-4 flex flex-col gap-4",
        )}
      >
        {renderContent()}
      </div>
    </div>
  );
}

// 移动端设置界面 - 使用 Drawer
function MobileSettings() {
  const isOpen = useStore(settingsModalOpen);
  const [activeTab, setActiveTab] = useState(null);
  const { t } = useTranslation();
  const handleSelectMenu = (id) => {
    setActiveTab(id);
  };
  const handleBack = () => {
    setActiveTab(null);
  };
  const handleClose = (value) => {
    settingsModalOpen.set(value);
    if (!value) {
      setActiveTab(null);
    }
  };

  // 计算当前显示的页面
  const currentPage = activeTab === null ? "menu" : "content";
  return (
    <Drawer open={isOpen} onOpenChange={handleClose} showSwipeHandle>
      <DrawerContent showOverlay={false} className="h-[85vh] p-0">
        <DrawerHeader className="px-4 py-1 flex flex-row items-center gap-2">
          {activeTab !== null && (
            <Button
              variant="secondary"
              className="size-6"
              onClick={handleBack}
              size="icon-sm"
              aria-label={t("common.back", { defaultValue: "Back" })}
              autoFocus
            >
              <ArrowLeft className="size-4 text-muted-foreground" />
            </Button>
          )}
          <DrawerTitle className="text-base font-medium">
            {activeTab === null
              ? t("common.settings")
              : t(
                  menuItems.find((item) => item.id === activeTab)
                    ?.translationKey || "",
                )}
          </DrawerTitle>
        </DrawerHeader>
        <div className="m-0 p-0 overflow-hidden" data-slot="overlay-body">
          <div className="t-settings-slide h-full" data-active={currentPage}>
            <div
              className="t-page"
              data-page-id="menu"
              inert={currentPage !== "menu"}
              aria-hidden={currentPage !== "menu"}
            >
              <MenuList onSelect={handleSelectMenu} />
            </div>
            <div
              className="t-page"
              data-page-id="content"
              inert={currentPage !== "content"}
              aria-hidden={currentPage !== "content"}
            >
              <ContentArea activeTab={activeTab} />
            </div>
          </div>
        </div>
        <DrawerClose
          render={<CloseButton className="absolute top-3 right-3" />}
        />
      </DrawerContent>
    </Drawer>
  );
}

// 桌面端设置界面 - 使用 Modal
function DesktopSettings() {
  const isOpen = useStore(settingsModalOpen);
  const [activeTab, setActiveTab] = useState("general");
  const { t } = useTranslation();
  const handleClose = (value) => {
    settingsModalOpen.set(value);
    if (!value) {
      setActiveTab("general");
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        showOverlay={false}
        className="w-[700px] max-w-[90vw] h-[600px] max-h-[85vh] p-0 overflow-hidden  bg-sidebar backdrop-blur-sm border shadow-2xl flex flex-col gap-0 sm:max-w-[700px]"
      >
        <div className="flex h-full">
          {/* 左侧导航栏 */}
          <div className="flex flex-col w-52">
            <div className="p-4 border-b mx-2">
              <DialogTitle className="text-lg font-semibold">
                {t("common.settings")}
              </DialogTitle>
            </div>
            <nav className="flex-1 overflow-y-auto p-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      const modalBody =
                        document.querySelector(".settings-content");
                      if (modalBody) {
                        modalBody.scrollTop = 0;
                      }
                    }}
                    data-active={isActive}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm outline-hidden ring-primary transition-[width,height,padding] cursor-pointer",
                      "data-[active=true]:bg-popover data-[active=true]:shadow-custom data-[active=true]:text-foreground",
                      "hover:cursor-pointer",
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span>{t(item.translationKey)}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 右侧内容区域 */}
          <div className="flex-1 flex flex-col min-w-0 py-2 pr-2">
            {/* Match the shell radius minus the 8px inset and 1px border. */}
            <ContentArea
              activeTab={activeTab}
              showTitle={true}
              className="md:rounded-[max(0px,calc(var(--radius-2xl)-var(--spacing)*2-1px))]"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 主组件 - 根据设备类型选择渲染方式
export default function SettingsModal() {
  const { isMedium } = useIsMobile();
  if (isMedium) {
    return <MobileSettings />;
  }
  return <DesktopSettings />;
}
