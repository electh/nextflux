import { lazy, Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import MediaLinkPill from "./MediaLinkPill.jsx";
import MediaPlaceholder from "./MediaPlaceholder.jsx";
import {
  getMediaLink,
  getMediaSelection,
} from "@/domain/articles/mediaSource.js";

const VideoJsPlayer = lazy(() => import("./VideoJsPlayer.jsx"));

export default function MediaPlayer(props) {
  const selection = getMediaSelection(props);
  const href = getMediaLink(selection);
  return (
    <div className="article-media-player not-prose my-4 w-full">
      <Suspense
        fallback={
          selection.kind === "audio" ? (
            <div className="flex h-24 w-full items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <MediaPlaceholder
              style={{
                aspectRatio: "16 / 9",
              }}
            />
          )
        }
      >
        <VideoJsPlayer {...props} />
      </Suspense>
      <MediaLinkPill href={href} />
    </div>
  );
}
