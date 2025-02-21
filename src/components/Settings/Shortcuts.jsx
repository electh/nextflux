import { ItemWrapper, KeyboardItem } from "@/components/ui/settingItem.jsx";
import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { shortcutsModalOpen } from "@/stores/modalStore.js";
import { useStore } from "@nanostores/react";
import { Keyboard, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Shortcuts() {
  const { t } = useTranslation();
  const shortcuts = {
    article: [
      { key: "J", desc: t("sidebar.shortcuts.next") },
      { key: "K", desc: t("sidebar.shortcuts.previous") },
      { key: "M", desc: t("sidebar.shortcuts.toggleRead") },
      { key: "S", desc: t("sidebar.shortcuts.toggleStar") },
      { key: "G", desc: t("sidebar.shortcuts.toggleReaderView") },
      { key: "ESC", desc: t("sidebar.shortcuts.close") },
      { key: "V", desc: t("sidebar.shortcuts.viewInBrowser") },
    ],
    global: [
      {
        key: "B",
        desc: t("sidebar.shortcuts.toggleSidebar"),
        kbdKey: ["ctrl"],
      },
      {
        key: "?",
        desc: t("sidebar.shortcuts.toggleShortcuts"),
      },
      { key: "R", desc: t("sidebar.shortcuts.refresh") },
      {
        key: "F",
        desc: t("sidebar.shortcuts.search"),
      },
      {
        key: "X",
        desc: t("sidebar.shortcuts.toggleCategory"),
      },
      {
        key: "N",
        desc: t("sidebar.shortcuts.nextCategoryOrFeed"),
      },
      {
        key: "P",
        desc: t("sidebar.shortcuts.prevCategoryOrFeed"),
      },
      {
        key: "N",
        desc: t("sidebar.shortcuts.addFeed"),
        kbdKey: ["shift"],
      },
    ],
  };
  const isOpen = useStore(shortcutsModalOpen);

  return (
    <>
      <Modal
        isOpen={isOpen}
        radius="md"
        scrollBehavior="inside"
        onOpenChange={(value) => {
          shortcutsModalOpen.set(value);
        }}
        classNames={{
          base: "m-2 standalone:mb-safe-or-2 max-h-[80vh] h-[612px] overflow-hidden bg-content2 dark:bg-content1 !shadow-custom",
          header:
            "border-b flex flex-col gap-3 p-3 bg-content1 dark:bg-transparent",
          footer: "hidden",
          body: "modal-body p-0 !block",
          closeButton: "hidden",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader>
                <div className="flex gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Keyboard className="size-4" />
                    <span className="text-base font-medium">
                      {t("sidebar.shortcuts.title")}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    radius="full"
                    variant="light"
                    isIconOnly
                    onPress={() => {
                      shortcutsModalOpen.set(false);
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="p-3 overflow-y-auto flex flex-col gap-4">
                  <ItemWrapper title={t("sidebar.shortcuts.global")}>
                    {shortcuts.global.map((shortcut, index) => (
                      <>
                        <KeyboardItem
                          key={shortcut.key}
                          keyStr={shortcut.key}
                          kbdKey={shortcut.kbdKey}
                          desc={shortcut.desc}
                        />
                        {index !== shortcuts.global.length - 1 && <Divider />}
                      </>
                    ))}
                  </ItemWrapper>
                  <ItemWrapper title={t("sidebar.shortcuts.article")}>
                    {shortcuts.article.map((shortcut, index) => (
                      <>
                        <KeyboardItem
                          key={shortcut.key}
                          keyStr={shortcut.key}
                          desc={shortcut.desc}
                        />
                        {index !== shortcuts.article.length - 1 && <Divider />}
                      </>
                    ))}
                  </ItemWrapper>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
