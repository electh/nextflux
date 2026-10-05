import { useEffect, useRef } from "react";
import { mediaProgress } from "@/services/mediaProgress.js";
import { createMediaProgressController } from "@/domain/articles/mediaProgressController.js";

export default function useAudioProgress(enclosure) {
  const controller = useRef(null);
  const media = useRef(null);
  const latestEnclosure = useRef(enclosure);
  latestEnclosure.current = enclosure;
  const enclosureId = enclosure?.id;
  useEffect(() => {
    if (!enclosureId) return;
    const progress = createMediaProgressController(
      latestEnclosure.current,
      mediaProgress,
    );
    controller.current = progress;
    if (media.current?.readyState >= 1) progress.restore(media.current);
    const flush = () => {
      if (media.current) progress.record(media.current, true);
      progress.flush();
    };
    const hide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", hide);
    return () => {
      progress.dispose();
      controller.current = null;
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [enclosureId]);

  const remember = (event, force = false, ended = false) => {
    media.current = event.currentTarget;
    controller.current?.record(media.current, force, ended);
  };
  return {
    onLoadedMetadata(event) {
      media.current = event.currentTarget;
      controller.current?.restore(media.current);
    },
    onCanPlay(event) {
      media.current = event.currentTarget;
      controller.current?.restore(media.current);
    },
    onPlay() {
      controller.current?.interact();
    },
    onSeeking() {
      controller.current?.interact();
    },
    onTimeUpdate: (event) => remember(event),
    onSeeked: (event) => remember(event, true),
    onPause: (event) => remember(event, true),
    onEnded: (event) => remember(event, true, true),
  };
}
