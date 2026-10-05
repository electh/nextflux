import {
  ArrowUpRight,
  Check,
  ChevronsUpDown,
  Cog,
  LogOut,
  Plus,
} from "lucide-react";
import {
  MorphDropdownMenu,
  MorphDropdownMenuTrigger,
  MorphDropdownMenuContent,
  MorphDropdownMenuGroup,
  MorphDropdownMenuItem,
} from "@/components/ui/morph-dropdown-menu";
import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authState, accountsState, switchAccount } from "@/stores/authStore.js";
import {
  settingsModalOpen,
  logoutModalOpen,
  addAccountModalOpen,
} from "@/stores/modalStore.js";
import { useSidebar } from "@/components/ui/sidebar.jsx";
import { useTranslation } from "react-i18next";
import { useStore } from "@nanostores/react";
import { useRef, useState } from "react";

function AccountAvatar({ username }) {
  const initial =
    Array.from((username || "").trim())[0]?.toLocaleUpperCase() || "?";
  return (
    <Avatar aria-hidden="true">
      <AvatarFallback>{initial}</AvatarFallback>
    </Avatar>
  );
}

export default function ProfileButton() {
  const { t } = useTranslation();
  const { username, serverUrl, id } = useStore(authState);
  const { accounts } = useStore(accountsState);
  const { isMobile, setOpenMobile } = useSidebar();
  const [menuOpen, setMenuOpen] = useState(false);
  const pendingAction = useRef(null);
  const closeSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };
  // Keep the account and sidebar stable until the menu has finished closing.
  const afterMenuClose = (action) => {
    if (pendingAction.current) return;
    pendingAction.current = action;
    setMenuOpen(false);
  };
  const handleCloseComplete = (open) => {
    if (open) return;
    const action = pendingAction.current;
    pendingAction.current = null;
    if (action) {
      closeSidebar();
      action();
    }
  };
  return (
    <div className="profile-button standalone:pb-safe flex items-center gap-4">
      <MorphDropdownMenu
        open={menuOpen}
        onOpenChange={(open, details) => {
          if (open && pendingAction.current) {
            details.cancel();
            return;
          }
          setMenuOpen(open);
        }}
        onOpenChangeComplete={handleCloseComplete}
      >
        <MorphDropdownMenuTrigger
          render={
            <Button
              size="sm"
              variant="ghost"
              className="h-auto py-2 px-3 w-full"
            >
              <AccountAvatar username={username} />
              <span className="flex flex-col items-start flex-1 min-w-0">
                <span className="truncate max-w-full">{username}</span>
                <span className="truncate max-w-full text-xs text-muted-foreground">
                  {serverUrl}
                </span>
              </span>
              <ChevronsUpDown data-icon="inline-end" />
            </Button>
          }
        />
        <MorphDropdownMenuContent
          side="top"
          align="start"
          className="profile-account-menu"
        >
          <MorphDropdownMenuGroup>
            <DropdownMenuLabel>
              {t("sidebar.profile.switchAccount")}
            </DropdownMenuLabel>
            {accounts.map((account) => (
              <MorphDropdownMenuItem
                key={account.id}
                disabled={account.id === id}
                onClick={() => afterMenuClose(() => switchAccount(account.id))}
              >
                <AccountAvatar username={account.username} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">{account.username}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {account.serverUrl}
                  </span>
                </span>
                {account.id === id && (
                  <Check aria-label={t("sidebar.profile.currentAccount")} />
                )}
              </MorphDropdownMenuItem>
            ))}
          </MorphDropdownMenuGroup>
          <DropdownMenuSeparator />
          <MorphDropdownMenuGroup aria-label={t("sidebar.profile.settings")}>
            <MorphDropdownMenuItem
              onClick={() =>
                afterMenuClose(() => addAccountModalOpen.set(true))
              }
            >
              <Plus />
              <span>{t("sidebar.profile.addAnotherAccount")}</span>
            </MorphDropdownMenuItem>
            <MorphDropdownMenuItem
              onClick={() => afterMenuClose(() => settingsModalOpen.set(true))}
            >
              <Cog />
              <span>{t("sidebar.profile.settings")}</span>
            </MorphDropdownMenuItem>
            <MorphDropdownMenuItem
              onClick={() =>
                window.open(serverUrl, "_blank", "noopener,noreferrer")
              }
            >
              <ArrowUpRight />
              <span>{t("sidebar.profile.openMiniflux")}</span>
            </MorphDropdownMenuItem>
            <MorphDropdownMenuItem
              variant="destructive"
              onClick={() => afterMenuClose(() => logoutModalOpen.set(true))}
            >
              <LogOut />
              <span>{t("sidebar.profile.logout")}</span>
            </MorphDropdownMenuItem>
          </MorphDropdownMenuGroup>
        </MorphDropdownMenuContent>
      </MorphDropdownMenu>
    </div>
  );
}
