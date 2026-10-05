import { Audio, AudioPlayer, AudioSkin } from "@videojs/react/audio";
import { Video, VideoPlayer, VideoSkin } from "@videojs/react/video";
import { I18nProvider } from "@videojs/react/i18n";
import { useTranslation } from "react-i18next";
import { lazy, Suspense, useState } from "react";
import { cn } from "@/lib/utils.js";
import MediaPlaceholder from "./MediaPlaceholder.jsx";
import {
  getAdapterSource,
  getMediaSelection,
} from "@/domain/articles/mediaSource.js";
import "@videojs/react/audio/skin.css";
import "@videojs/react/video/skin.css";

const adapterMedia = {
  "hls-video": lazy(() =>
    import("@videojs/react/media/hlsjs-video").then((module) => ({
      default: module.HlsJsVideo,
    })),
  ),
  "hls-audio": lazy(() =>
    import("@videojs/react/media/hls-audio").then((module) => ({
      default: module.HlsAudio,
    })),
  ),
  "youtube-video": lazy(() =>
    import("@videojs/react/media/youtube-video").then((module) => ({
      default: module.YouTubeVideo,
    })),
  ),
};

const skinStyle = {
  width: "100%",
  "--media-accent-color": "var(--primary)",
  "--media-accent-text-color": "var(--primary-foreground)",
  "--media-border-radius": "var(--radius-lg)",
};

export default function VideoJsPlayer(props) {
  const { i18n } = useTranslation();
  const selection = getMediaSelection(props);
  const Player = selection.kind === "audio" ? AudioPlayer : VideoPlayer;
  return (
    <I18nProvider locale={i18n.resolvedLanguage || i18n.language}>
      <Player key={JSON.stringify([selection, props.sources, props.tracks])}>
        <PlayerSurface {...props} selection={selection} />
      </Player>
    </I18nProvider>
  );
}

function PlayerSurface({
  selection,
  src,
  sources = [],
  tracks = [],
  poster,
  loop,
  muted,
  crossOrigin,
  title,
}) {
  const [ready, setReady] = useState(false);
  const isAudio = selection.kind === "audio";
  const Skin = isAudio ? AudioSkin : VideoSkin;
  const Media =
    adapterMedia[`${selection.adapter}-${selection.kind}`] ||
    (isAudio ? Audio : Video);
  const isNative = selection.adapter === "native";
  const loading = !isAudio && !ready;
  const aspectRatio = "16 / 9";

  return (
    <div className="relative w-full">
      {loading && (
        <MediaPlaceholder
          style={{ position: "absolute", inset: 0, aspectRatio }}
        />
      )}
      <div
        className={cn(loading && "opacity-0 pointer-events-none")}
        aria-hidden={loading || undefined}
        inert={loading || undefined}
      >
        <Skin
          style={
            isAudio
              ? skinStyle
              : {
                  ...skinStyle,
                  aspectRatio,
                }
          }
        >
          <Suspense fallback={null}>
            <Media
              src={isNative ? src : selection.src}
              source={getAdapterSource(selection)}
              poster={isAudio ? undefined : poster}
              playsInline
              preload="metadata"
              loop={loop}
              muted={muted}
              crossOrigin={crossOrigin}
              aria-label={title}
              onLoadedMetadata={() => setReady(true)}
              onCanPlay={() => setReady(true)}
              onError={() => setReady(true)}
            >
              {isNative &&
                sources.map((source, index) => (
                  <source key={index} {...source} />
                ))}
              {tracks.map((track, index) => (
                <track key={index} {...track} />
              ))}
            </Media>
          </Suspense>
        </Skin>
      </div>
    </div>
  );
}
