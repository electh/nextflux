export * from "@/db/repositories/articleRepository.js";
export * from "@/db/repositories/categoryRepository.js";
export * from "@/db/repositories/feedRepository.js";
export * from "@/db/repositories/iconRepository.js";
import { createSyncMetadataRepository } from "@/db/repositories/syncMetadataRepository.js";
import { sessionAccount } from "@/stores/authStore.js";
import { accountStorageKey } from "@/domain/auth/accounts.js";

export const {
  setLastSyncTime,
  getLastSyncTime,
  getSyncBootstrap,
  setSyncBootstrap,
  isHistorySyncComplete,
  setHistorySyncComplete,
} = createSyncMetadataRepository((key) =>
  accountStorageKey(sessionAccount, key),
);
export * from "@/db/repositories/syncRepository.js";
