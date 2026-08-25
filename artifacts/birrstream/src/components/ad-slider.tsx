import { useState, useRef, useCallback, useEffect } from "react";
import { Phone, Send } from "lucide-react";
import logoNaomi from "@/assets/decor/LogoNaomi.jpg";

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
      className="relative z-10 -mx-4 rounded-none overflow-hidden bg-[#1A1A1A] shadow-md border-y border-white/10"
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

      {/* Subtle Vignettes for crisp text readability over videos */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent pointer-events-none z-10" />

      {/* Top Right: Sharp Ad Badge flush in the far right top corner */}
      <div className="absolute top-0 right-0 z-20 flex items-center gap-1.5 px-3 py-1 bg-white text-black pointer-events-none select-none shadow-md">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[11px] font-bold tracking-wider uppercase">Ad</span>
      </div>

      {/* Top Left: Original Naomi Labs Logo without background card */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none select-none drop-shadow-md">
        <img
          src={logoNaomi}
          alt="Naomi Labs"
          className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-white/40"
        />
        <span
          className="text-white text-[15px] font-bold tracking-wider"
          style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.08em" }}
        >
          Naomi Labs
        </span>
      </div>

      {/* Bottom Left: Contact Info */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-0.5 px-2.5 py-1.5 rounded-xl bg-black/55 backdrop-blur-md border border-white/15 text-white shadow-lg pointer-events-none select-none">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/95">
          <Phone className="w-3 h-3 text-primary flex-shrink-0" />
          <span>+251 911 234 567</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/75">
          <Send className="w-2.5 h-2.5 text-sky-400 flex-shrink-0" />
          <span>@naomilabs_et</span>
        </div>
      </div>

      {/* Bottom Right: Dot indicators */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-20 bg-black/45 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/15 shadow-sm">
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
                  ? "w-4 h-1.5 bg-primary shadow-sm shadow-primary/40"
                  : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
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
