import { useState, useRef, useCallback, useEffect } from "react";

const AD_VIDEOS = [
  "/ads/1.mp4",
  "/ads/2.mp4",
  "/ads/3.mp4",
  "/ads/4.mp4",
  "/ads/5.mp4",
  "/ads/7.mp4",
];

export function AdSlider() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [nextSlideIdx, setNextSlideIdx] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const total = AD_VIDEOS.length;

  const slideToNext = useCallback(
    (targetIdx: number) => {
      if (animating) return;
      setNextSlideIdx(targetIdx);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true);
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

  // Play the active video whenever the index changes
  useEffect(() => {
    const vid = videoRefs.current[activeIdx];
    if (!vid) return;

    // Show loading spinner until this video has enough data
    const canPlay = () => setLoading(false);

    if (vid.readyState >= 3) {
      // HAVE_FUTURE_DATA or better — already buffered
      setLoading(false);
      vid.currentTime = 0;
      vid.play().catch(() => {});
    } else {
      setLoading(true);
      vid.addEventListener("canplay", canPlay, { once: true });
      vid.currentTime = 0;
      vid.play().catch(() => {});
    }

    return () => vid.removeEventListener("canplay", canPlay);
  }, [activeIdx]);

  return (
    <div
      className="relative z-10 -mx-4 rounded-3xl overflow-hidden bg-[#1A1A1A]"
      style={{ aspectRatio: "16 / 9" }}
    >
      {/* All videos are pre-mounted and preloaded; only the active one is visible */}
      {AD_VIDEOS.map((src, i) => {
        const isActive = i === activeIdx;
        const isNext = i === nextSlideIdx;
        const visible = isActive || isNext;

        let transform = "translateX(100%)"; // hidden off-screen right
        if (isActive) {
          transform = animating ? "translateX(-100%)" : "translateX(0)";
        } else if (isNext) {
          transform = animating ? "translateX(0)" : "translateX(100%)";
        }

        return (
          <div
            key={i}
            className="absolute inset-0 w-full h-full"
            style={{
              transform,
              transition: visible && animating
                ? "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                : "none",
              visibility: visible ? "visible" : "hidden",
            }}
          >
            <video
              ref={(el) => { videoRefs.current[i] = el; }}
              src={src}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload={i <= 1 ? "auto" : "metadata"}
              onEnded={isActive ? handleVideoEnded : undefined}
            />
          </div>
        );
      })}

      {/* Preload the next video aggressively once current is playing */}
      <PreloadNext videoRefs={videoRefs} activeIdx={activeIdx} total={total} />

      {/* Loading spinner overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#1A1A1A]">
          <div className="w-8 h-8 border-3 border-white/20 border-t-primary rounded-full animate-spin" />
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

/** Eagerly sets preload="auto" on the next video so it buffers ahead of time */
function PreloadNext({
  videoRefs,
  activeIdx,
  total,
}: {
  videoRefs: React.RefObject<(HTMLVideoElement | null)[]>;
  activeIdx: number;
  total: number;
}) {
  useEffect(() => {
    const nextIdx = (activeIdx + 1) % total;
    const vid = videoRefs.current?.[nextIdx];
    if (vid && vid.preload !== "auto") {
      vid.preload = "auto";
      vid.load();
    }
  }, [activeIdx, total, videoRefs]);
  return null;
}
