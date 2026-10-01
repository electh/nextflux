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
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (e) => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
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
      onLoad={() => {
        setIsLoading(false);
        onLoad?.();
      }}
      onError={handleError}
      {...props}
    />
  );

  if (isLoading) {
    return (
      <div className="relative">
        {isLoading && (
          <div className={cn("absolute inset-0 bg-secondary", className)} />
        )}
        {imageElement}
      </div>
    );
  }

  return imageElement;
};
