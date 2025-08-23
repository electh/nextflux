import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { CirclePlus, FolderPlus, Rss, Upload } from "lucide-react";
import { addCategoryModalOpen, addFeedModalOpen } from "@/stores/modalStore";
import { useSidebar } from "@/components/ui/sidebar.jsx";
import { useRef } from "react";
import minifluxAPI from "@/api/miniflux";
import { addToast } from "@heroui/react";
import { forceSync } from "@/stores/syncStore";
import { useTranslation } from "react-i18next";

export default function AddFeedButton() {
  const { t } = useTranslation();
  const { isNarrow, setOpenMobile } = useSidebar();
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await minifluxAPI.importOPML(file);
      await forceSync(); // 重新加载订阅源列表以更新UI
      await minifluxAPI.refreshAllFeeds(); // 触发所有订阅源的刷新
      addToast({ title: t("common.success"), color: "success" });
    } catch (error) {
      console.error("OPML导入失败:", error);
      addToast({ title: t("common.error"), color: "danger" });
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

      <Dropdown>
        <DropdownTrigger>
          <Button size="sm" radius="full" variant="light" isIconOnly>
            <CirclePlus className="size-4 text-default-500" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions" variant="flat">
          <DropdownItem
            key="newFeed"
            startContent={<Rss className="size-4 text-default-500" />}
            onPress={() => {
              addFeedModalOpen.set(true);
              isNarrow && setOpenMobile(false);
            }}
          >
            {t("sidebar.addFeed")}
          </DropdownItem>
          <DropdownItem
            key="importOPML"
            startContent={<Upload className="size-4 text-default-500" />}
            onPress={() => {
              fileInputRef.current?.click();
              isNarrow && setOpenMobile(false);
            }}
          >
            {t("sidebar.importOPML")}
          </DropdownItem>
          <DropdownItem
            isDisabled
            classNames={{ base: "py-1.5 opacity-100" }}
            textValue="divider"
          >
            <Divider />
          </DropdownItem>
          <DropdownItem
            key="newCategory"
            startContent={<FolderPlus className="size-4 text-default-500" />}
            onPress={() => {
              addCategoryModalOpen.set(true);
              isNarrow && setOpenMobile(false);
            }}
          >
            {t("sidebar.addCategory")}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </>
  );
}
