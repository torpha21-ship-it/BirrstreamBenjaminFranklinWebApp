import { useState, useEffect } from "react";

interface NaomiLoaderProps {
  message?: string;
}

const CHAR_SEQUENCE = ["N", "A", "O", "M", "I", "L", "A", "B", "S"];

export function NaomiLoader({ message = "LOADING NAOMI LABS..." }: NaomiLoaderProps) {
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCharIndex((prev) => (prev + 1) % CHAR_SEQUENCE.length);
    }, 400);
    return () => clearInterval(timer);
  }, []);

  const currentChar = CHAR_SEQUENCE[charIndex];

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0F0F11] text-white select-none px-4 overflow-hidden">
      {/* Embedded CSS for Nguyen Gobber / Hofmann CSS Font Characters */}
      <style>{`
        .naomi-char-container {
          --size: min(40vmin, 200px);
          --gap-size: 2px;
          --circles: 4;
          --circles-y: 4;
          --circle-size: calc((var(--size) - (var(--gap-size) * (var(--circles-y) - 1))) / var(--circles-y));
          --line-width: 0.7cqi;
          position: relative;
          display: grid;
          grid-template-columns: repeat(var(--circles), 1fr);
          grid-template-rows: repeat(4, 1fr);
          gap: var(--gap-size);
          height: var(--size);
          aspect-ratio: var(--circles)/var(--circles-y);
          container-type: inline-size;
        }

        .naomi-char-container.sm {
          --size: min(8vmin, 32px);
          --gap-size: 1px;
        }

        .naomi-char-container span {
          border: var(--line-width, 0.7cqi) solid rgba(255, 255, 255, 0.12);
          border-radius: var(--circle-size);
          aspect-ratio: 1;
        }

        .naomi-char-container:not([data-char=M]) span:nth-of-type(16),
        .naomi-char-container:not([data-char=M]) span:nth-of-type(17),
        .naomi-char-container:not([data-char=M]) span:nth-of-type(18),
        .naomi-char-container:not([data-char=M]) span:nth-of-type(19),
        .naomi-char-container:not([data-char=M]) span:nth-of-type(20) {
          display: none;
        }

        .naomi-char-container::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: #139AB4;
          background: linear-gradient(135deg, #139AB4 0%, #FED538 100%);
          --circle-half: calc(var(--circle-size) / 2);
          --circle-quart: calc(var(--circle-size) / 1.7);
          --angle-half: calc(var(--circle-half) * cos(45deg));
          --angle-quart: calc(var(--circle-quart) * cos(49deg));
          --circle-1-start: 0;
          --circle-1-middle: var(--circle-half);
          --circle-1-end: var(--circle-size);
          --circle-2-start: calc(var(--circle-size) + var(--gap-size));
          --circle-2-middle: calc(var(--circle-2-start) + var(--circle-half));
          --circle-2-end: calc(var(--circle-2-start) + var(--circle-size));
          --circle-3-start: calc((2 * var(--circle-size)) + (2 * var(--gap-size)));
          --circle-3-middle: calc(var(--circle-3-start) + var(--circle-half));
          --circle-3-end: calc(var(--circle-3-start) + var(--circle-size));
          --circle-4-start: calc((3 * var(--circle-size)) + (3 * var(--gap-size)));
          --circle-4-middle: calc(var(--circle-4-start) + var(--circle-half));
          --circle-4-end: calc(var(--circle-4-start) + var(--circle-size));
          --circle-5-start: calc((4 * var(--circle-size)) + (4 * var(--gap-size)));
          --circle-5-middle: calc(var(--circle-5-start) + var(--circle-half));
          --circle-5-end: calc(var(--circle-5-start) + var(--circle-size));
          clip-path: shape(from 0% 0%, close);
          transition: clip-path 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* N */
        .naomi-char-container[data-char=N]::after,
        .naomi-char-container[data-char=n]::after {
          clip-path: shape(from var(--circle-1-middle) var(--circle-1-start), line to var(--circle-2-middle) var(--circle-1-start), arc to var(--circle-2-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-3-start) var(--circle-2-middle), arc to var(--circle-3-end) var(--circle-2-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-4-start) var(--circle-1-middle), arc to var(--circle-4-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-4-end) var(--circle-4-middle), arc to var(--circle-4-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-2-middle) + var(--angle-half)) calc(var(--circle-3-middle) - var(--angle-half)), arc to var(--circle-2-start) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-1-end) var(--circle-4-middle), arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-1-middle) - var(--angle-quart)) calc(var(--circle-4-middle) - var(--angle-quart)) of var(--circle-quart) var(--circle-quart) cw, line to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-2-middle) + var(--angle-half)), arc to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-2-middle) - var(--angle-half)) of var(--circle-quart) var(--circle-quart) ccw, line to calc(var(--circle-1-middle) - var(--angle-half)) calc(var(--circle-1-middle) + var(--angle-half)), arc to var(--circle-1-start) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-1-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, close);
        }

        /* A */
        .naomi-char-container[data-char=A]::after,
        .naomi-char-container[data-char=a]::after {
          clip-path: shape(from var(--circle-3-middle) var(--circle-1-start), arc to var(--circle-3-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-4-start) var(--circle-3-middle), arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-3-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-4-middle) + var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)), arc to var(--circle-4-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-4-middle) - var(--angle-quart)) calc(var(--circle-4-middle) + var(--angle-quart)) of var(--circle-quart) var(--circle-quart) cw, line to calc(var(--circle-2-middle) + var(--angle-quart)) calc(var(--circle-4-middle) - var(--angle-quart)), arc to var(--circle-2-middle) var(--circle-4-start) of var(--circle-half) var(--circle-half) ccw, arc to calc(var(--circle-2-middle) - var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)), arc to var(--circle-1-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-1-middle) - var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-3-middle) - var(--angle-half)) calc(var(--circle-1-middle) - var(--angle-half)), arc to var(--circle-3-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, close);
        }

        /* O / o */
        .naomi-char-container[data-char=O]::after,
        .naomi-char-container[data-char=o]::after {
          clip-path: shape(from var(--circle-4-end) var(--circle-2-middle), line to var(--circle-4-end) var(--circle-3-middle), arc to calc(var(--circle-4-middle) + var(--angle-half)) calc(var(--circle-3-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-3-middle) + var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)), arc to var(--circle-3-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-middle) var(--circle-4-end), arc to calc(var(--circle-2-middle) - var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-1-middle) - var(--angle-quart)) calc(var(--circle-2-middle) + var(--angle-quart)), arc to calc(var(--circle-1-middle) - var(--angle-half)) calc(var(--circle-2-middle) - var(--angle-half)) of var(--circle-quart) var(--circle-quart) cw, line to calc(var(--circle-3-middle) - var(--angle-quart)) calc(var(--circle-1-middle) - var(--angle-quart)), arc to calc(var(--circle-3-middle) + var(--angle-half)) calc(var(--circle-1-middle) - var(--angle-half)) of var(--circle-quart) var(--circle-quart) cw, arc to var(--circle-3-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-4-middle) var(--circle-2-start) of var(--circle-size) var(--circle-size) ccw, line to var(--circle-4-middle) var(--circle-2-start), arc to var(--circle-4-end) var(--circle-2-middle) of var(--circle-quart) var(--circle-quart) cw, line to var(--circle-3-end) var(--circle-2-middle), arc to var(--circle-3-middle) var(--circle-2-start) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-2-middle) var(--circle-2-start), arc to var(--circle-2-start) var(--circle-2-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-2-start) var(--circle-3-middle), arc to var(--circle-2-middle) var(--circle-3-end) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-3-middle) var(--circle-3-end), arc to var(--circle-3-end) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-3-end) var(--circle-2-middle), close);
        }

        /* M / m */
        .naomi-char-container[data-char=M],
        .naomi-char-container[data-char=m] {
          --circles: 5;
        }
        .naomi-char-container[data-char=M]::after,
        .naomi-char-container[data-char=m]::after {
          clip-path: shape(from var(--circle-1-start) var(--circle-1-middle), arc to var(--circle-1-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-1-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-2-middle) + var(--angle-half)) calc(var(--circle-2-middle) - var(--angle-half)), arc to var(--circle-2-end) var(--circle-2-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-3-start) var(--circle-3-middle), arc to var(--circle-3-end) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-4-start) var(--circle-2-middle), arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-2-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-5-middle) - var(--angle-half)) calc(var(--circle-1-middle) - var(--angle-half)), arc to var(--circle-5-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-5-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-5-end) var(--circle-4-middle), arc to var(--circle-5-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-4-end) var(--circle-3-middle), arc to var(--circle-4-start) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-3-end) var(--circle-4-middle), arc to var(--circle-3-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-end) var(--circle-3-middle), arc to var(--circle-2-start) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-1-end) var(--circle-4-middle), arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-1-start) var(--circle-1-middle), close);
        }

        /* I / i */
        .naomi-char-container[data-char=I]::after,
        .naomi-char-container[data-char=i]::after {
          clip-path: shape(from var(--circle-2-middle) var(--circle-1-start), line to var(--circle-3-middle) var(--circle-1-start), arc to var(--circle-3-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-3-end) var(--circle-4-middle), arc to var(--circle-3-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-middle) var(--circle-4-end), arc to var(--circle-2-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-start) var(--circle-1-middle), arc to var(--circle-2-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, close);
        }

        /* L / l */
        .naomi-char-container[data-char=L]::after,
        .naomi-char-container[data-char=l]::after {
          clip-path: shape(from var(--circle-1-middle) var(--circle-1-start), line to var(--circle-2-middle) var(--circle-1-start), arc to var(--circle-2-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-end) var(--circle-3-middle), line to var(--circle-4-middle) var(--circle-3-middle), arc to var(--circle-4-end) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-4-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, line to var(--circle-1-middle) var(--circle-4-end), arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-1-start) var(--circle-1-middle), arc to var(--circle-1-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, close);
        }

        /* B / b */
        .naomi-char-container[data-char=B]::after,
        .naomi-char-container[data-char=b]::after {
          clip-path: shape(from var(--circle-1-middle) var(--circle-1-start), line to var(--circle-3-middle) var(--circle-1-start), arc to var(--circle-4-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-3-middle) var(--circle-2-end) of var(--circle-half) var(--circle-half) cw, line to var(--circle-3-middle) var(--circle-2-end), arc to var(--circle-4-end) var(--circle-3-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-3-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, line to var(--circle-1-middle) var(--circle-4-end), arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-1-start) var(--circle-1-middle), arc to var(--circle-1-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, close);
        }

        /* S / s */
        .naomi-char-container[data-char=S]::after,
        .naomi-char-container[data-char=s]::after {
          clip-path: shape(from var(--circle-4-middle) var(--circle-1-start), line to var(--circle-2-middle) var(--circle-1-start), arc to var(--circle-1-start) var(--circle-2-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-3-middle) var(--circle-3-end), arc to var(--circle-4-end) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-3-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, line to var(--circle-1-middle) var(--circle-4-end), arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, close);
        }

        /* H / h */
        .naomi-char-container[data-char=H]::after,
        .naomi-char-container[data-char=h]::after {
          clip-path: shape(from var(--circle-1-middle) var(--circle-1-start), arc to var(--circle-1-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-start) var(--circle-2-middle), arc to var(--circle-2-middle) var(--circle-2-end) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-3-middle) var(--circle-2-end), arc to var(--circle-3-end) var(--circle-2-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-4-start) var(--circle-1-middle), arc to var(--circle-4-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-4-middle) + var(--angle-quart)) calc(var(--circle-1-middle) + var(--angle-quart)) of var(--circle-quart) var(--circle-quart) cw, line to var(--circle-4-start) var(--circle-3-middle), arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-3-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-4-middle) + var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)), arc to var(--circle-4-end) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-4-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-3-middle) + var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)), arc to var(--circle-3-middle) var(--circle-4-start) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-2-middle) var(--circle-4-start), arc to calc(var(--circle-2-middle) - var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)), arc to calc(var(--circle-1-middle) - var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-3-middle) + var(--angle-half)), arc to var(--circle-1-end) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-1-middle) - var(--angle-quart)) calc(var(--circle-1-middle) + var(--angle-quart)), arc to var(--circle-1-start) var(--circle-1-middle) of var(--circle-quart) var(--circle-quart) cw, arc to var(--circle-1-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, close);
        }
      `}</style>

      {/* Main Animated Character Display */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Glowing aura background */}
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full transform scale-150 animate-pulse pointer-events-none" />

        {/* Large Cycling Character */}
        <div className="naomi-char-container shadow-2xl relative z-10" data-char={currentChar}>
          <span /><span /><span /><span />
          <span /><span /><span /><span />
          <span /><span /><span /><span />
          <span /><span /><span /><span />
          <span /><span /><span /><span />
        </div>

        {/* Mini "NAOMI LABS" spelled out using the font characters */}
        <div className="mt-6 flex items-center justify-center gap-1.5 relative z-10 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-md">
          {["N", "A", "O", "M", "I"].map((c, i) => (
            <div key={`n-${i}`} className="naomi-char-container sm" data-char={c}>
              <span /><span /><span /><span />
              <span /><span /><span /><span />
              <span /><span /><span /><span />
              <span /><span /><span /><span />
              <span /><span /><span /><span />
            </div>
          ))}
          <div className="w-2" /> {/* Space */}
          {["L", "A", "B", "S"].map((c, i) => (
            <div key={`l-${i}`} className="naomi-char-container sm" data-char={c}>
              <span /><span /><span /><span />
              <span /><span /><span /><span />
              <span /><span /><span /><span />
              <span /><span /><span /><span />
              <span /><span /><span /><span />
            </div>
          ))}
        </div>

        {/* Status text below */}
        <div className="mt-4 flex flex-col items-center gap-2 text-center relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <p className="text-xs uppercase tracking-widest text-[#139AB4] font-mono font-bold">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
