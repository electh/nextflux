import { normalizeMediaProgress } from "../../services/mediaProgressFactory.js";

export function createMediaProgressController(
  enclosure,
  service,
  now = Date.now,
) {
  let disposed = false;
  let interacted = false;
  let restored = false;
  let lastPosition;
  let lastSave = now();
  const position = service.load(enclosure);
  return {
    async restore(media) {
      const saved = await position;
      if (
        disposed ||
        interacted ||
        restored ||
        !Number.isFinite(media.duration) ||
        media.duration <= 0
      )
        return;
      // Completed episodes start again at the beginning.
      const target = saved >= media.duration ? 0 : saved;
      restored = true;
      lastPosition = normalizeMediaProgress(target);
      if (target > 0) media.currentTime = target;
      service.flush(enclosure.id);
    },
    interact() {
      interacted = true;
    },
    record(media, force = false, ended = false) {
      if (!interacted || disposed || !Number.isFinite(media.currentTime))
        return;
      const current =
        ended || media.ended ? 0 : normalizeMediaProgress(media.currentTime);
      if (current !== lastPosition) {
        lastPosition = current;
        service.remember(enclosure.id, current);
      }
      if (force || now() - lastSave >= 10000) {
        lastSave = now();
        service.flush(enclosure.id);
      }
    },
    flush() {
      service.flush(enclosure.id);
    },
    dispose() {
      disposed = true;
      service.flush(enclosure.id);
    },
  };
}
