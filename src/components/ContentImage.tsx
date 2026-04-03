"use client";

import Image from "next/image";
import { useState } from "react";
import { isDataImageUrl } from "@/lib/is-data-image-url";
import { ImagePlaceholder } from "./ImagePlaceholder";

export function hasRenderableImageSrc(src: string | undefined | null): boolean {
  return typeof src === "string" && src.trim().length > 0;
}

type ContentImageProps = {
  src: string;
  alt: string;
  /** Use when the parent establishes aspect ratio / bounds (e.g. hero, cards). */
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  /** Force next/image unoptimized (e.g. data URLs handled separately). */
  unoptimized?: boolean;
};

/**
 * Public-site images: no request for empty `src`, optional pulse placeholder while loading, fallback on error.
 */
export default function ContentImage({
  src,
  alt,
  fill,
  sizes,
  className = "",
  priority,
  unoptimized,
}: ContentImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const hasSrc = hasRenderableImageSrc(src);
  const showImg = hasSrc && !error;
  const unopt = unoptimized ?? isDataImageUrl(src);
  /** LCP / hero: avoid staying at opacity 0 if onLoad is delayed or never fires. */
  const fadeInUntilLoaded = !priority;
  const showPlaceholder = !showImg || (fadeInUntilLoaded && !loaded);

  return (
    <div
      className={[
        "relative overflow-hidden",
        fill ? "absolute inset-0 h-full w-full min-h-0" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showPlaceholder && (
        <ImagePlaceholder className="absolute inset-0 z-[1]" animate={showImg && !loaded && fadeInUntilLoaded} />
      )}
      {showImg &&
        (isDataImageUrl(src) ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URLs / admin uploads
          <img
            src={src}
            alt={alt}
            className={[
              "absolute inset-0 z-[2] h-full w-full object-cover transition-opacity duration-500",
              fadeInUntilLoaded && !loaded ? "opacity-0" : "opacity-100",
            ].join(" ")}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            decoding="async"
            fetchPriority={priority ? "high" : undefined}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            unoptimized={unopt}
            className={[
              "z-[2] object-cover transition-opacity duration-500",
              fadeInUntilLoaded && !loaded ? "opacity-0" : "opacity-100",
            ].join(" ")}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        ))}
    </div>
  );
}
