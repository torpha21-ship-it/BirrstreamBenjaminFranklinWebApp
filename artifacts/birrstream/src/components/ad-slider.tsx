import { useState, useRef, useCallback, useEffect } from "react";

const AD_VIDEOS = [
  "/ads/ai-video-7951.mp4",
  "/ads/ai-video-7952.mp4",
  "/ads/ai-video-7953.mp4",
  "/ads/ai-video-7957.mp4",
  "/ads/ai-video-7960.mp4",
  "/ads/ai-video-7961.mp4",
  "/ads/ai-video-7962.mp4",
  "/ads/ai-video-7963.mp4",
  "/ads/ai-video-7964.mp4",
  "/ads/kling_20260728_VIDEO_High_end_c_5669_0 (online-video-cutter.com).mp4",
];

export function AdSlider() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [nextSlideIdx, setNextSlideIdx] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  const total = AD_VIDEOS.length;

  const slideToNext = useCallback(
    (targetIdx: number) => {
      if (animating) return;
      // Stage the next slide off-screen, then trigger animation
      setNextSlideIdx(targetIdx);
      // Force a layout read before animating so the next slide is positioned off-screen
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true);
          // After transition completes, commit
          setTimeout(() => {
            setActiveIdx(targetIdx);
            setNextSlideIdx(null);
            setAnimating(false);
          }, 500);
        });
      });
    },
    [animating]
  );

  const handleVideoEnded = useCallback(() => {
    const next = (activeIdx + 1) % total;
    slideToNext(next);
  }, [activeIdx, total, slideToNext]);

  // Auto-play the active video whenever the index changes
  useEffect(() => {
    const vid = videoRefs.current.get(activeIdx);
    if (vid) {
      vid.currentTime = 0;
      vid.play().catch(() => {});
    }
  }, [activeIdx]);

  return (
    <div
      className="relative z-10 -mx-4 rounded-3xl overflow-hidden bg-black"
      style={{ aspectRatio: "16 / 9" }}
    >
      {/* Current (active) video */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          transform: animating ? "translateX(-100%)" : "translateX(0)",
          transition: animating
            ? "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
            : "none",
        }}
      >
        <video
          ref={(el) => { if (el) videoRefs.current.set(activeIdx, el); }}
          key={`active-${activeIdx}`}
          src={AD_VIDEOS[activeIdx]}
          className="w-full h-full object-cover"
          muted
          playsInline
          autoPlay
          onEnded={handleVideoEnded}
        />
      </div>

      {/* Next video — starts at 100% (off-screen right), slides to 0 */}
      {nextSlideIdx !== null && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            transform: animating ? "translateX(0)" : "translateX(100%)",
            transition: animating
              ? "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
              : "none",
          }}
        >
          <video
            ref={(el) => { if (el) videoRefs.current.set(nextSlideIdx, el); }}
            key={`next-${nextSlideIdx}`}
            src={AD_VIDEOS[nextSlideIdx]}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        </div>
      )}

      {/* Dot indicators */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        {AD_VIDEOS.map((_, i) => {
          const isCurrent = i === activeIdx && !animating;
          const isTarget = nextSlideIdx !== null && i === nextSlideIdx && animating;
          const active = isCurrent || isTarget;
          return (
            <button
              key={i}
              aria-label={`Ad ${i + 1}`}
              onClick={() => {
                if (i === activeIdx || animating) return;
                slideToNext(i);
              }}
              className={`rounded-full transition-all duration-300 ${
                active
                  ? "w-5 h-2 bg-primary shadow-sm shadow-primary/40"
                  : "w-2 h-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
