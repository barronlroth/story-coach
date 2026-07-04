type PinnedDrawingProps = {
  imageUrl: string;
  alt?: string;
  caption?: string;
  className?: string;
};

export function PinnedDrawing({
  imageUrl,
  alt = "Submitted child drawing",
  caption,
  className = "",
}: PinnedDrawingProps) {
  return (
    <figure className={`relative mx-auto w-full max-w-xl ${className}`}>
      <div className="absolute -top-4 left-1/2 z-10 h-8 w-28 -translate-x-1/2 rotate-[-3deg] rounded-[4px] border border-[rgba(169,121,76,0.22)] bg-[rgba(246,201,76,0.72)] shadow-sm" />
      <div className="absolute -left-2 top-10 z-10 h-9 w-9 rotate-[-12deg] rounded-full border border-[rgba(47,42,34,0.16)] bg-[var(--accent-coral)] shadow-md" />
      <div className="relative rotate-[-1.5deg] rounded-[16px] border border-[var(--border-paper)] bg-[var(--surface-paper)] p-3 shadow-[var(--shadow-paper)]">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[10px] border border-[rgba(218,196,155,0.7)] bg-[#fffdf5] shadow-inner">
          <img src={imageUrl} alt={alt} className="h-full w-full object-contain" draggable={false} />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(255,255,255,0.45),transparent_22%),linear-gradient(135deg,rgba(118,98,76,0.06),transparent_34%)]" />
        </div>
        {caption ? (
          <figcaption className="mt-2 px-1 text-sm font-black text-[var(--ink-soft)]">
            {caption}
          </figcaption>
        ) : null}
        <div className="absolute bottom-0 right-0 h-10 w-10 rounded-tl-[18px] bg-[linear-gradient(135deg,rgba(218,196,155,0.18),rgba(255,255,255,0.8))] shadow-[-4px_-4px_12px_rgba(78,56,28,0.08)]" />
      </div>
    </figure>
  );
}
