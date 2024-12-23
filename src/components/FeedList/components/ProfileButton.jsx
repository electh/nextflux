import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { ChevronsUpDown, Cog, ExternalLink, LogOut } from "lucide-react";
import { authState, logout } from "@/stores/authStore.js";
import { settingsModalOpen } from "@/stores/settingsStore.js";
import { useSidebar } from "@/components/ui/sidebar.jsx";

export default function ProfileButton() {
  const { username, serverUrl } = authState.get();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <div className="profile-button flex items-center gap-4">
      <Dropdown>
        <DropdownTrigger>
          <Button
            size="sm"
            radius="sm"
            variant="light"
            className="h-auto p-2 w-full"
            endContent={<ChevronsUpDown className="size-4 text-default-500" />}
          >
            <div className="flex items-center w-full gap-2">
              <Avatar name={username} radius="sm" size="sm" />
              <div className="flex flex-col items-start">
                <div className="font-semibold">{username}</div>
                <div className="text-xs text-default-400 line-clamp-1">
                  {serverUrl}
                </div>
              </div>
            </div>
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Profile Actions" variant="flat">
          <DropdownItem
            key="settings"
            textValue="settings"
            startContent={<Cog className="size-4" />}
            onPress={() => {
              settingsModalOpen.set(true);
              isMobile && setOpenMobile(false);
            }}
          >
            设置
          </DropdownItem>
          <DropdownItem
            key="open_miniflux"
            textValue="open_miniflux"
            startContent={<ExternalLink className="size-4" />}
            onPress={() => {
              window.open(serverUrl, "_blank");
            }}
          >
            打开 Miniflux
          </DropdownItem>
          <DropdownItem
            key="logout"
            textValue="logout"
            color="danger"
            startContent={<LogOut className="size-4" />}
            onPress={() => logout()}
          >
            注销
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
