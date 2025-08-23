import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
  ChevronsUpDown,
  Cog,
  ExternalLink,
  Info,
  Keyboard,
  LogOut,
  CircleUser,
} from "lucide-react";
import { authState } from "@/stores/authStore.js";
import { settingsModalOpen } from "@/stores/modalStore.js";
import {
  aboutModalOpen,
  logoutModalOpen,
  shortcutsModalOpen,
} from "@/stores/modalStore.js";
import { useSidebar } from "@/components/ui/sidebar.jsx";
import { useTranslation } from "react-i18next";

export default function ProfileButton() {
  const { t } = useTranslation();
  const { username, serverUrl } = authState.get();
  const { isNarrow, setOpenMobile } = useSidebar();

  return (
    <div className="profile-button standalone:pb-safe flex items-center gap-4">
      <Dropdown>
        <DropdownTrigger>
          <Button
            size="sm"
            radius="sm"
            variant="light"
            className="h-auto p-2 w-full"
            startContent={<CircleUser className="size-4 text-default-500" />}
            endContent={<ChevronsUpDown className="size-4 text-default-500" />}
          >
            <div className="flex items-center w-full gap-2">
              {/*<Avatar name={username} radius="sm" size="sm" />*/}
              <div className="flex flex-col items-start">
                <div className="font-semibold dark:text-foreground">{username}</div>
                {/*<div className="text-xs text-default-400 line-clamp-1">*/}
                {/*  {serverUrl}*/}
                {/*</div>*/}
              </div>
            </div>
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Profile Actions" variant="flat">
          <DropdownItem
            key="about"
            textValue="about"
            startContent={<Info className="size-4 text-default-500" />}
            onPress={() => {
              aboutModalOpen.set(true);
              isNarrow && setOpenMobile(false);
            }}
          >
            {t("sidebar.profile.about")}
          </DropdownItem>
          <DropdownItem
            key="settings"
            textValue="settings"
            startContent={<Cog className="size-4 text-default-500" />}
            onPress={() => {
              settingsModalOpen.set(true);
              isNarrow && setOpenMobile(false);
            }}
          >
            {t("sidebar.profile.settings")}
          </DropdownItem>
          <DropdownItem
            key="shortcuts"
            textValue="shortcuts"
            startContent={<Keyboard className="size-4 text-default-500" />}
            onPress={() => {
              shortcutsModalOpen.set(true);
              isNarrow && setOpenMobile(false);
            }}
          >
            {t("sidebar.shortcuts.title")}
          </DropdownItem>
          <DropdownItem
            key="open_miniflux"
            textValue="open_miniflux"
            startContent={<ExternalLink className="size-4 text-default-500" />}
            onPress={() => {
              window.open(serverUrl, "_blank");
            }}
          >
            {t("sidebar.profile.openMiniflux")}
          </DropdownItem>
          <DropdownItem
            isDisabled
            classNames={{ base: "py-1.5 opacity-100" }}
            textValue="divider"
          >
            <Divider />
          </DropdownItem>
          <DropdownItem
            key="logout"
            textValue="logout"
            className="text-danger"
            variant="flat"
            color="danger"
            startContent={<LogOut className="size-4" />}
            onPress={() => {
              logoutModalOpen.set(true);
              isNarrow && setOpenMobile(false);
            }}
          >
            {t("sidebar.profile.logout")}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
