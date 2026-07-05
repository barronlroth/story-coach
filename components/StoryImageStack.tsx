import { cx } from "@/lib/design-tokens";

export type StoryImageStackItem = {
  imageUrl: string;
  alt: string;
};

type StoryImageStackProps = {
  images: StoryImageStackItem[];
  caption?: string;
  className?: string;
};

export function StoryImageStack({
  images,
  caption = "Story so far",
  className,
}: StoryImageStackProps) {
  const visibleImages = images.slice(-5);

  if (visibleImages.length === 0) {
    return (
      <figure className={cx("relative mx-auto w-full max-w-xl", className)}>
        <div className="flex aspect-[16/9] items-center justify-center rounded-[16px] border border-[var(--border-paper)] bg-white text-lg font-black text-[var(--ink-soft)] shadow-[var(--shadow-paper)]">
          {caption}
        </div>
      </figure>
    );
  }

  return (
    <figure className={cx("relative mx-auto w-full max-w-xl", className)} aria-label={caption}>
      <div className="relative aspect-[16/9]">
        {visibleImages.map((image, index) => {
          const isTopImage = index === visibleImages.length - 1;
          const offsetFromTop = visibleImages.length - 1 - index;
          const rotation = [-4, 3, -2, 2, -1][index] ?? 0;

          return (
            <div
              key={`${image.imageUrl}-${index}`}
              className="absolute inset-0 rounded-[16px] border border-[var(--border-paper)] bg-[var(--surface-paper)] p-3 shadow-[var(--shadow-paper)]"
              style={{
                transform: `translate(${-offsetFromTop * 10}px, ${-offsetFromTop * 7}px) rotate(${rotation}deg)`,
                zIndex: index + 1,
              }}
            >
              <div className="relative h-full overflow-hidden rounded-[10px] border border-[rgba(218,196,155,0.7)] bg-[#fffdf5] shadow-inner">
                <img
                  src={image.imageUrl}
                  alt={image.alt}
                  className={cx("h-full w-full object-contain", !isTopImage && "opacity-[0.88]")}
                  draggable={false}
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(255,255,255,0.45),transparent_22%),linear-gradient(135deg,rgba(118,98,76,0.06),transparent_34%)]" />
              </div>
            </div>
          );
        })}
        <div className="absolute -left-2 top-3 z-20 h-9 w-9 rotate-[-12deg] rounded-full border border-[rgba(47,42,34,0.16)] bg-[var(--accent-coral)] shadow-md" />
        <div className="absolute left-1/2 top-[-16px] z-20 h-8 w-28 -translate-x-1/2 rotate-[-3deg] rounded-[4px] border border-[rgba(169,121,76,0.22)] bg-[rgba(246,201,76,0.72)] shadow-sm" />
      </div>
      <figcaption className="mt-5 px-1 text-center text-sm font-black text-[var(--ink-soft)]">
        {caption}
      </figcaption>
    </figure>
  );
}
