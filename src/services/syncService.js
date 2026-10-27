import minifluxApi from "@/api/miniflux.js";
import * as repository from "@/db/storage.js";
import { mapEntryToArticle } from "@/domain/articles/mapEntryToArticle.js";
import { createSyncService } from "@/services/syncServiceFactory.js";

import * as outboxRepository from "@/db/repositories/outboxRepository.js";
import { createOutboxService } from "@/services/outboxServiceFactory.js";

export const flushOutbox = createOutboxService({
  repository: outboxRepository,
  api: minifluxApi,
});

export const syncService = createSyncService({
  api: minifluxApi,
  repository,
  mapEntry: mapEntryToArticle,
});
