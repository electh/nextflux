import { atom } from "nanostores";
import { settingsState } from "./settingsStore.js";

// Apply the default once per page load, then preserve the user's selection across routes.
export const filter = atom(
  settingsState.get().showUnreadByDefault ? "unread" : "all",
);
