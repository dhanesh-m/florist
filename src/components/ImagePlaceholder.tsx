/** Neutral block used while images load or when no image URL is configured (no hardcoded photos). */

export function ImagePlaceholder({
  className = "",
  animate = true,
}: {
  className?: string;
  /** Subtle pulse while waiting for the real image. */
  animate?: boolean;
}) {
  return (
    <div
      className={[
        "flex h-full w-full min-h-[4rem] items-center justify-center bg-gradient-to-br from-beige-200/90 via-beige-100/70 to-gold-100/50",
        animate ? "animate-pulse" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <svg
        className="h-10 w-10 text-beige-400/60 md:h-12 md:w-12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <path d="M9 9h.01" />
        <path d="M15 9h.01" />
        <path d="M12 16v-1" />
      </svg>
    </div>
  );
}
