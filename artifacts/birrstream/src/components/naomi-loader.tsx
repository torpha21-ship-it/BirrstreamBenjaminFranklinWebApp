import { useState, useEffect } from "react";

/**
 * Original "CSS Chars (Nguyen Gobber: Hofmann)" loader — applied as-is.
 * Cycles through the available characters defined in the original style.css.
 * Available chars: H, o, f, M, A, N, n, R, r
 */

const CYCLE_CHARS = "NAoMI".split("");

export function NaomiLoader({ message }: { message?: string }) {
  const [char, setChar] = useState(CYCLE_CHARS[0]);

  useEffect(() => {
    let index = 0;
    const id = setInterval(() => {
      index = (index + 1) % CYCLE_CHARS.length;
      setChar(CYCLE_CHARS[index]);
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="naomi-loader-root">
      {/* Original style.css from css-chars-nguyen-gobber-hofmann/dist — verbatim */}
      <style>{`
.naomi-loader-root {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #F5ECE3;
  color: #1F1C1F;
}

.naomi-loader-root [data-char] {
  --size: 40vmin;
  --gap-size: .2vmin;
  --circles: 4;
  --circles-y: 4;
  --circle-size: calc((var(--size) - (var(--gap-size) * (var(--circles-y) - 1))) / var(--circles-y));
  --line-width: .7cqi;
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--circles), 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: var(--gap-size);
  height: var(--size);
  aspect-ratio: var(--circles)/var(--circles-y);
  container-type: inline-size;
}

.naomi-loader-root [data-char] span {
  border: var(--line-width, 0.7cqi) solid rgba(0, 0, 0, 0.15);
  border-radius: var(--circle-size);
  aspect-ratio: 1;
}

.naomi-loader-root [data-char]:not([data-char=M]) span:nth-of-type(16),
.naomi-loader-root [data-char]:not([data-char=M]) span:nth-of-type(17),
.naomi-loader-root [data-char]:not([data-char=M]) span:nth-of-type(18),
.naomi-loader-root [data-char]:not([data-char=M]) span:nth-of-type(19) {
  display: none;
}

.naomi-loader-root [data-char]:after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: currentcolor;
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
}

.naomi-loader-root [data-char=H]:after {
  clip-path: shape(from var(--circle-1-middle) var(--circle-1-start), arc to var(--circle-1-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-start) var(--circle-2-middle), arc to var(--circle-2-middle) var(--circle-2-end) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-3-middle) var(--circle-2-end), arc to var(--circle-3-end) var(--circle-2-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-4-start) var(--circle-1-middle), arc to var(--circle-4-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-4-middle) + var(--angle-quart)) calc(var(--circle-1-middle) + var(--angle-quart)) of var(--circle-quart) var(--circle-quart) cw, line to var(--circle-4-start) var(--circle-3-middle), arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-3-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-4-middle) + var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)), arc to var(--circle-4-end) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-4-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-3-middle) + var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)), arc to var(--circle-3-middle) var(--circle-4-start) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-2-middle) var(--circle-4-start), arc to calc(var(--circle-2-middle) - var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)), arc to calc(var(--circle-1-middle) - var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-3-middle) + var(--angle-half)), arc to var(--circle-1-end) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-1-middle) - var(--angle-quart)) calc(var(--circle-1-middle) + var(--angle-quart)), arc to var(--circle-1-start) var(--circle-1-middle) of var(--circle-quart) var(--circle-quart) cw, arc to var(--circle-1-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, close);
}

.naomi-loader-root [data-char=o]:after {
  clip-path: shape(from var(--circle-4-end) var(--circle-2-middle), line to var(--circle-4-end) var(--circle-3-middle), arc to calc(var(--circle-4-middle) + var(--angle-half)) calc(var(--circle-3-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-3-middle) + var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)), arc to var(--circle-3-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-middle) var(--circle-4-end), arc to calc(var(--circle-2-middle) - var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-1-middle) - var(--angle-quart)) calc(var(--circle-2-middle) + var(--angle-quart)), arc to calc(var(--circle-1-middle) - var(--angle-half)) calc(var(--circle-2-middle) - var(--angle-half)) of var(--circle-quart) var(--circle-quart) cw, line to calc(var(--circle-3-middle) - var(--angle-quart)) calc(var(--circle-1-middle) - var(--angle-quart)), arc to calc(var(--circle-3-middle) + var(--angle-half)) calc(var(--circle-1-middle) - var(--angle-half)) of var(--circle-quart) var(--circle-quart) cw, arc to var(--circle-3-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-4-middle) var(--circle-2-start) of var(--circle-size) var(--circle-size) ccw, line to var(--circle-4-middle) var(--circle-2-start), arc to var(--circle-4-end) var(--circle-2-middle) of var(--circle-quart) var(--circle-quart) cw, line to var(--circle-3-end) var(--circle-2-middle), arc to var(--circle-3-middle) var(--circle-2-start) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-2-middle) var(--circle-2-start), arc to var(--circle-2-start) var(--circle-2-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-2-start) var(--circle-3-middle), arc to var(--circle-2-middle) var(--circle-3-end) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-3-middle) var(--circle-3-end), arc to var(--circle-3-end) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-3-end) var(--circle-2-middle), close);
}

.naomi-loader-root [data-char=f]:after {
  clip-path: shape(from var(--circle-1-middle) var(--circle-1-start), line to var(--circle-4-middle) var(--circle-1-start), arc to var(--circle-4-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-4-end) var(--circle-2-middle), arc to var(--circle-4-middle) var(--circle-2-end) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-2-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-3-middle) + var(--angle-half)) calc(var(--circle-2-middle) - var(--angle-half)), arc to var(--circle-3-middle) var(--circle-2-start) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-2-middle) var(--circle-2-start), arc to var(--circle-2-middle) var(--circle-2-end) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-4-middle) var(--circle-3-start), arc to var(--circle-4-middle) var(--circle-3-end) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-3-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-3-middle) + var(--angle-half)) calc(var(--circle-3-middle) - var(--angle-half)), arc to var(--circle-3-start) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-2-end) var(--circle-4-middle), arc to var(--circle-2-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, line to var(--circle-1-middle) var(--circle-4-end), arc to calc(var(--circle-1-middle) - var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-3-middle) + var(--angle-half)), arc to var(--circle-1-end) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, arc to calc(var(--circle-1-middle) + var(--angle-quart)) calc(var(--circle-3-middle) - var(--angle-quart)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-1-middle) - var(--angle-quart)) calc(var(--circle-1-middle) + var(--angle-quart)), arc to var(--circle-1-start) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-1-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, close);
}

.naomi-loader-root [data-char=M] {
  --circles: 5;
}
.naomi-loader-root [data-char=M]:after {
  clip-path: shape(from var(--circle-1-start) var(--circle-1-middle), arc to var(--circle-1-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-1-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-2-middle) + var(--angle-half)) calc(var(--circle-2-middle) - var(--angle-half)), arc to var(--circle-2-end) var(--circle-2-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-3-start) var(--circle-3-middle), arc to var(--circle-3-end) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-4-start) var(--circle-2-middle), arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-2-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-5-middle) - var(--angle-half)) calc(var(--circle-1-middle) - var(--angle-half)), arc to var(--circle-5-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-5-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-5-end) var(--circle-4-middle), arc to var(--circle-5-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-4-end) var(--circle-3-middle), arc to var(--circle-4-start) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-3-end) var(--circle-4-middle), arc to var(--circle-3-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-end) var(--circle-3-middle), arc to var(--circle-2-start) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-1-end) var(--circle-4-middle), arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-1-start) var(--circle-1-middle), close);
}

.naomi-loader-root [data-char=A]:after {
  clip-path: shape(from var(--circle-3-middle) var(--circle-1-start), arc to var(--circle-3-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-4-start) var(--circle-3-middle), arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-3-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-4-middle) + var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)), arc to var(--circle-4-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-4-middle) - var(--angle-quart)) calc(var(--circle-4-middle) + var(--angle-quart)) of var(--circle-quart) var(--circle-quart) cw, line to calc(var(--circle-2-middle) + var(--angle-quart)) calc(var(--circle-4-middle) - var(--angle-quart)), arc to var(--circle-2-middle) var(--circle-4-start) of var(--circle-half) var(--circle-half) ccw, arc to calc(var(--circle-2-middle) - var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)), arc to var(--circle-1-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-1-middle) - var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-3-middle) - var(--angle-half)) calc(var(--circle-1-middle) - var(--angle-half)), arc to var(--circle-3-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, close);
}

.naomi-loader-root [data-char=N]:after {
  clip-path: shape(from var(--circle-1-middle) var(--circle-1-start), line to var(--circle-2-middle) var(--circle-1-start), arc to var(--circle-2-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-3-start) var(--circle-2-middle), arc to var(--circle-3-end) var(--circle-2-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-4-start) var(--circle-1-middle), arc to var(--circle-4-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-4-end) var(--circle-4-middle), arc to var(--circle-4-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-2-middle) + var(--angle-half)) calc(var(--circle-3-middle) - var(--angle-half)), arc to var(--circle-2-start) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-1-end) var(--circle-4-middle), arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-1-middle) - var(--angle-quart)) calc(var(--circle-4-middle) - var(--angle-quart)) of var(--circle-quart) var(--circle-quart) cw, line to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-2-middle) + var(--angle-half)), arc to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-2-middle) - var(--angle-half)) of var(--circle-quart) var(--circle-quart) ccw, line to calc(var(--circle-1-middle) - var(--angle-half)) calc(var(--circle-1-middle) + var(--angle-half)), arc to var(--circle-1-start) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-1-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, close);
}

.naomi-loader-root [data-char=n]:after {
  clip-path: shape(from var(--circle-1-middle) var(--circle-1-start), arc to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-1-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-3-middle) - var(--angle-half)) calc(var(--circle-2-middle) + var(--angle-half)), arc to var(--circle-3-end) var(--circle-2-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-4-start) var(--circle-1-middle), arc to var(--circle-4-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-4-end) var(--circle-2-middle), arc to calc(var(--circle-4-middle) + var(--angle-half)) calc(var(--circle-2-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-3-middle) - var(--angle-half)), arc to var(--circle-4-start) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-3-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-4-middle) + var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)), arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-2-middle) + var(--angle-half)) calc(var(--circle-3-middle) - var(--angle-half)), arc to var(--circle-2-start) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-1-end) var(--circle-4-middle), arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-1-start) var(--circle-1-middle), arc to var(--circle-1-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, close);
}

.naomi-loader-root [data-char=R]:after {
  clip-path: shape(from var(--circle-1-middle) var(--circle-1-start), line to var(--circle-4-middle) var(--circle-1-start), arc to var(--circle-4-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-4-end) var(--circle-2-middle), arc to var(--circle-4-middle) var(--circle-2-end) of var(--circle-half) var(--circle-half) cw, line to var(--circle-3-middle) var(--circle-3-start), arc to var(--circle-3-middle) var(--circle-3-end) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-4-middle) var(--circle-4-start), line to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)), arc to var(--circle-4-end) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-4-end) var(--circle-4-middle), arc to calc(var(--circle-4-middle) - var(--angle-quart)) calc(var(--circle-4-middle) + var(--angle-quart)) of var(--circle-quart) var(--circle-quart) cw, line to calc(var(--circle-2-middle) + var(--angle-quart)) calc(var(--circle-4-middle) - var(--angle-quart)), arc to calc(var(--circle-2-middle) - var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)) of var(--circle-quart) var(--circle-quart) ccw, line to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)), arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-1-start) var(--circle-1-middle), arc to var(--circle-1-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-middle) var(--circle-2-start), arc to var(--circle-2-middle) var(--circle-2-end) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-3-middle) var(--circle-2-end), arc to var(--circle-3-middle) var(--circle-2-start) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-2-middle) var(--circle-2-start), close);
}

.naomi-loader-root [data-char=r]:after {
  clip-path: shape(from var(--circle-1-middle) var(--circle-1-start), line to var(--circle-3-middle) var(--circle-1-start), arc to var(--circle-3-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-3-end) var(--circle-2-middle), arc to calc(var(--circle-3-middle) + var(--angle-half)) calc(var(--circle-2-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-3-middle) - var(--angle-half)) calc(var(--circle-3-middle) - var(--angle-half)), arc to var(--circle-3-start) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, arc to var(--circle-3-middle) var(--circle-3-end) of var(--circle-half) var(--circle-half) ccw, arc to calc(var(--circle-3-middle) + var(--angle-half)) calc(var(--circle-3-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-3-middle) - var(--angle-half)), arc to var(--circle-4-end) var(--circle-3-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-4-end) var(--circle-4-middle), arc to calc(var(--circle-4-middle) - var(--angle-quart)) calc(var(--circle-4-middle) + var(--angle-quart)) of var(--circle-quart) var(--circle-quart) cw, line to calc(var(--circle-2-middle) + var(--angle-quart)) calc(var(--circle-4-middle) - var(--angle-quart)), arc to calc(var(--circle-2-middle) - var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)) of var(--circle-quart) var(--circle-quart) ccw, line to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)), arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-1-start) var(--circle-1-middle), arc to var(--circle-1-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-middle) var(--circle-2-start), arc to var(--circle-2-middle) var(--circle-2-end) of var(--circle-half) var(--circle-half) ccw, arc to var(--circle-2-middle) var(--circle-2-start) of var(--circle-half) var(--circle-half) ccw, close);
}

.naomi-loader-root .loader-anim [data-char]:after {
  opacity: 0.8;
}

.naomi-loader-root .loader-status {
  margin-top: 2rem;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  opacity: 0.5;
}
      `}</style>

      {/* Animated cycling character — original structure from index.html */}
      <div className="loader-anim">
        <div data-char={char}>
          <span /><span /><span /><span />
          <span /><span /><span /><span />
          <span /><span /><span /><span />
          <span /><span /><span /><span />
          {/* Extra spans for M (5-column grid) */}
          <span /><span /><span /><span />
        </div>
      </div>

      {message && <p className="loader-status">{message}</p>}
    </div>
  );
}
