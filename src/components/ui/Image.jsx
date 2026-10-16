import { useState } from "react";
import { cn } from "@/lib/utils";

export const Image = ({
  src,
  alt,
  className,
  fallbackSrc,
  onLoad,
  onError,
  ...props
}) => {
  const [loadedSrc, setLoadedSrc] = useState(null);
  const [failedSrc, setFailedSrc] = useState(null);
  const imgSrc = failedSrc === src && fallbackSrc ? fallbackSrc : src;
  const isLoading = loadedSrc !== imgSrc;

  const handleError = (e) => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setFailedSrc(src);
      return;
    }
    onError?.(e);
  };

  const imageElement = (
    <img
      src={imgSrc}
      alt={alt}
      className={cn(
        isLoading && "opacity-0",
        "transition-opacity duration-300 animate-in fade-in",
        className,
      )}
      onLoad={(event) => {
        setLoadedSrc(imgSrc);
        onLoad?.(event);
      }}
      onError={handleError}
      {...props}
    />
  );

  return (
    <div className="relative">
      {isLoading && (
        <div className={cn("absolute inset-0 bg-secondary", className)} />
      )}
      {imageElement}
    </div>
  );
};
