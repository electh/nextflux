import {
  getEnclosure,
  updateEnclosureProgress,
} from "@/api/resources/enclosures.js";
import { sessionAccount } from "@/stores/authStore.js";
import { accountStorageKey } from "@/domain/auth/accounts.js";
import { reportError } from "@/lib/errors.js";
import { createMediaProgressService } from "./mediaProgressFactory.js";

const memory = new Map();
let stopped = false;
window.addEventListener("nextflux:logout", () => {
  stopped = true;
  memory.clear();
});
const key = (id) => accountStorageKey(sessionAccount, `mediaProgress:v1:${id}`);

export const mediaProgress = createMediaProgressService({
  read(id) {
    if (stopped) return undefined;
    if (memory.has(id)) return memory.get(id);
    try {
      const record = JSON.parse(localStorage.getItem(key(id)));
      if (Number.isFinite(record?.position) && record.position >= 0)
        return record;
    } catch {
      /* Storage may be unavailable. Keep playback working. */
    }
    return undefined;
  },
  write(id, record) {
    if (stopped) return;
    memory.set(id, record);
    try {
      localStorage.setItem(key(id), JSON.stringify(record));
    } catch {
      /* The in-memory copy still survives article navigation. */
    }
  },
  fetch: getEnclosure,
  update: (id, position) => {
    if (!stopped) return updateEnclosureProgress(id, position);
  },
  onError: (error) => reportError(error, "mediaProgress.save"),
});
