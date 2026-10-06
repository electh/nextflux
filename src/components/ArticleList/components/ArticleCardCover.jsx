import { useRef, useState } from "react";
import { cn } from "@/lib/utils.js";
import { settingsState } from "@/stores/settingsStore";
import { useStore } from "@nanostores/react";
import { ImageOff } from "lucide-react";
import { memo } from "react";
import { Image } from "@/components/ui/Image.jsx";

function ArticleCardCover({ imageUrl }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const imgRef = useRef(null);
  const { cardImageSize } = useStore(settingsState);

  if (!imageUrl) {
    return null;
  }

  if (error) {
    return (
      <div
        className={cn(
          "card-image relative bg-secondary rounded-lg shadow-custom overflow-hidden",
          cardImageSize === "large"
            ? "aspect-video w-full"
            : "w-20 h-20 shrink-0",
        )}
      >
        <div className="card-image-content flex flex-col items-center justify-center h-full gap-2 text-muted-foreground transition-opacity">
          <ImageOff className="size-5 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={cn(
        "card-image relative bg-secondary rounded-lg shadow-custom overflow-hidden",
        loading && "animate-pulse!",
        cardImageSize === "large"
          ? "aspect-video w-full"
          : "w-20 h-20 shrink-0",
      )}
    >
      <div className="card-image-content h-full transition-opacity">
        <Image
          alt=""
          src={imageUrl}
          onLoad={() => setLoading(false)}
          onError={() => setError(true)}
          loading="eager"
          className={cn(
            "object-cover",
            cardImageSize === "large"
              ? "aspect-video w-full"
              : "aspect-square w-20",
          )}
        />
      </div>
    </div>
  );
}

const arePropsEqual = (prevProps, nextProps) => {
  return prevProps.imageUrl === nextProps.imageUrl;
};

export default memo(ArticleCardCover, arePropsEqual);
