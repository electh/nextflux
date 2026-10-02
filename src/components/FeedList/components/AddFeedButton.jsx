import {
  MorphDropdownMenu,
  MorphDropdownMenuTrigger,
  MorphDropdownMenuContent,
  MorphDropdownMenuGroup,
  MorphDropdownMenuItem,
} from "@/components/ui/morph-dropdown-menu";
import { Button } from "@/components/ui/button";
import { CirclePlus, FolderPlus, Rss, Upload } from "lucide-react";
import { addCategoryModalOpen, addFeedModalOpen } from "@/stores/modalStore";
import { useSidebar } from "@/components/ui/sidebar.jsx";
import { useRef } from "react";
import minifluxAPI from "@/api/miniflux";
import { toast } from "sonner";
import { forceSync } from "@/stores/syncStore";
import { useTranslation } from "react-i18next";
import { reportError } from "@/lib/errors.js";
export default function AddFeedButton() {
  const { t } = useTranslation();
  const { isMobile, setOpenMobile } = useSidebar();
  const fileInputRef = useRef(null);
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await minifluxAPI.importOPML(file);
      await forceSync(); // 重新加载订阅源列表以更新UI
      await minifluxAPI.refreshAllFeeds(); // 触发所有订阅源的刷新
      toast.success(t("common.success"));
    } catch (error) {
      reportError(error, "feed.importOpml");
      toast.error(t("common.error"));
    } finally {
      // 清空文件输入框,以便重复选择同一文件
      e.target.value = "";
    }
  };
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".opml,.xml"
        onChange={handleFileChange}
        className="hidden"
      />

      <MorphDropdownMenu>
        <MorphDropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm">
              <CirclePlus className="size-4 text-muted-foreground" />
            </Button>
          }
        />
        <MorphDropdownMenuContent align="end">
          <MorphDropdownMenuGroup>
            <MorphDropdownMenuItem
              onClick={() =>
                ((key) => {
                  if (key === "newFeed") {
                    addFeedModalOpen.set(true);
                    isMobile && setOpenMobile(false);
                  }
                  if (key === "importOPML") {
                    fileInputRef.current?.click();
                    isMobile && setOpenMobile(false);
                  }
                  if (key === "newCategory") {
                    addCategoryModalOpen.set(true);
                    isMobile && setOpenMobile(false);
                  }
                })("newFeed")
              }
            >
              <Rss className="size-4 text-muted-foreground" />
              <span>{t("sidebar.addFeed")}</span>
            </MorphDropdownMenuItem>
            <MorphDropdownMenuItem
              onClick={() =>
                ((key) => {
                  if (key === "newFeed") {
                    addFeedModalOpen.set(true);
                    isMobile && setOpenMobile(false);
                  }
                  if (key === "importOPML") {
                    fileInputRef.current?.click();
                    isMobile && setOpenMobile(false);
                  }
                  if (key === "newCategory") {
                    addCategoryModalOpen.set(true);
                    isMobile && setOpenMobile(false);
                  }
                })("importOPML")
              }
            >
              <Upload className="size-4 text-muted-foreground" />
              <span>{t("sidebar.importOPML")}</span>
            </MorphDropdownMenuItem>
            <MorphDropdownMenuItem
              onClick={() =>
                ((key) => {
                  if (key === "newFeed") {
                    addFeedModalOpen.set(true);
                    isMobile && setOpenMobile(false);
                  }
                  if (key === "importOPML") {
                    fileInputRef.current?.click();
                    isMobile && setOpenMobile(false);
                  }
                  if (key === "newCategory") {
                    addCategoryModalOpen.set(true);
                    isMobile && setOpenMobile(false);
                  }
                })("newCategory")
              }
            >
              <FolderPlus className="size-4 text-muted-foreground" />
              <span>{t("sidebar.addCategory")}</span>
            </MorphDropdownMenuItem>
          </MorphDropdownMenuGroup>
        </MorphDropdownMenuContent>
      </MorphDropdownMenu>
    </>
  );
}
