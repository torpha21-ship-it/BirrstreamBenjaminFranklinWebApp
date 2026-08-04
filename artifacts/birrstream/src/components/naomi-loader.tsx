import { useState, useEffect } from "react";

const CYCLE_NAME = ["N", "A", "O", "M", "I", "L", "A", "B", "S"];

export function NaomiLoader() {
  const [char, setChar] = useState(CYCLE_NAME[0]);

  useEffect(() => {
    let index = 0;
    const id = setInterval(() => {
      index = (index + 1) % CYCLE_NAME.length;
      setChar(CYCLE_NAME[index]);
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hofmann-loader-wrapper">
      <style>{CSS_STYLES}</style>

      {/* Left side — static small letters: NAOMI (top) / LABS (bottom) */}
      <div className="hofmann-left-container">
        <div>
          <div data-char="N"></div>
          <div data-char="A"></div>
          <div data-char="O"></div>
          <div data-char="M"></div>
          <div data-char="I"></div>
          <br />
          <div data-char="L"></div>
          <div data-char="A"></div>
          <div data-char="B"></div>
          <div data-char="S"></div>
        </div>
      </div>

      {/* Right side — animated morphing character with circle grid visible behind */}
      <div className="hofmann-right-anim">
        <div data-char={char}>
          <span /><span /><span /><span />
          <span /><span /><span /><span />
          <span /><span /><span /><span />
          <span /><span /><span /><span />
          <span /><span /><span /><span />
        </div>
      </div>
    </div>
  );
}

const CSS_STYLES = `
.hofmann-loader-wrapper {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  padding: 8vmin;
  min-height: 100vh;
  background: #F5ECE3;
  color: #1F1C1F;
  box-sizing: border-box;
}

/* Left side — static small letters */
.hofmann-left-container {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.hofmann-left-container [data-char] {
  --size: 8vw;
  --gap-size: .2vw;
  display: inline-block;
  margin: 0 var(--gap-size) var(--gap-size) 0;
}

/* Right side — animated morphing character */
.hofmann-right-anim {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.hofmann-right-anim [data-char] {
  --size: 25vw;
  --gap-size: .2vw;
}

/* Opacity 0.8 on morphing character so circle grid lines shine through */
.hofmann-right-anim [data-char]:after {
  opacity: 0.8;
}

.hofmann-loader-wrapper [data-char] {
  --circles: 4;
  --circles-y: 4;
  --circle-size: calc((var(--size) - (var(--gap-size) * (var(--circles-y) - 1))) / var(--circles-y));
  --line-width: .7cqi;
  position: relative;
  display: inline-grid;
  grid-template-columns: repeat(var(--circles), 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: var(--gap-size);
  height: var(--size);
  aspect-ratio: var(--circles)/var(--circles-y);
  container-type: inline-size;
}

/* 4x4 Grid of circle outlines */
.hofmann-loader-wrapper [data-char] span {
  border: var(--line-width, 0.7cqi) solid rgba(0, 0, 0, 0.15);
  border-radius: var(--circle-size);
  aspect-ratio: 1;
}

.hofmann-loader-wrapper [data-char]:not([data-char=M]):not([data-char=m]) span:nth-of-type(16),
.hofmann-loader-wrapper [data-char]:not([data-char=M]):not([data-char=m]) span:nth-of-type(17),
.hofmann-loader-wrapper [data-char]:not([data-char=M]):not([data-char=m]) span:nth-of-type(18),
.hofmann-loader-wrapper [data-char]:not([data-char=M]):not([data-char=m]) span:nth-of-type(19),
.hofmann-loader-wrapper [data-char]:not([data-char=M]):not([data-char=m]) span:nth-of-type(20) {
  display: none;
}

.hofmann-loader-wrapper [data-char]:after {
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
  transition: clip-path 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* N / n */
.hofmann-loader-wrapper [data-char=N]:after,
.hofmann-loader-wrapper [data-char=n]:after {
  clip-path: shape(from var(--circle-1-middle) var(--circle-1-start), line to var(--circle-2-middle) var(--circle-1-start), arc to var(--circle-2-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-3-start) var(--circle-2-middle), arc to var(--circle-3-end) var(--circle-2-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-4-start) var(--circle-1-middle), arc to var(--circle-4-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-4-end) var(--circle-4-middle), arc to var(--circle-4-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-2-middle) + var(--angle-half)) calc(var(--circle-3-middle) - var(--angle-half)), arc to var(--circle-2-start) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-1-end) var(--circle-4-middle), arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-1-middle) - var(--angle-quart)) calc(var(--circle-4-middle) - var(--angle-quart)) of var(--circle-quart) var(--circle-quart) cw, line to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-2-middle) + var(--angle-half)), arc to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-2-middle) - var(--angle-half)) of var(--circle-quart) var(--circle-quart) ccw, line to calc(var(--circle-1-middle) - var(--angle-half)) calc(var(--circle-1-middle) + var(--angle-half)), arc to var(--circle-1-start) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-1-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, close);
}

/* A / a */
.hofmann-loader-wrapper [data-char=A]:after,
.hofmann-loader-wrapper [data-char=a]:after {
  clip-path: shape(from var(--circle-3-middle) var(--circle-1-start), arc to var(--circle-3-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-4-start) var(--circle-3-middle), arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-3-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-4-middle) + var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)), arc to var(--circle-4-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-4-middle) - var(--angle-quart)) calc(var(--circle-4-middle) + var(--angle-quart)) of var(--circle-quart) var(--circle-quart) cw, line to calc(var(--circle-2-middle) + var(--angle-quart)) calc(var(--circle-4-middle) - var(--angle-quart)), arc to var(--circle-2-middle) var(--circle-4-start) of var(--circle-half) var(--circle-half) ccw, arc to calc(var(--circle-2-middle) - var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)), arc to var(--circle-1-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-1-middle) - var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-3-middle) - var(--angle-half)) calc(var(--circle-1-middle) - var(--angle-half)), arc to var(--circle-3-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, close);
}

/* O / o */
.hofmann-loader-wrapper [data-char=O]:after,
.hofmann-loader-wrapper [data-char=o]:after {
  clip-path: shape(from var(--circle-4-end) var(--circle-2-middle), line to var(--circle-4-end) var(--circle-3-middle), arc to calc(var(--circle-4-middle) + var(--angle-half)) calc(var(--circle-3-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-3-middle) + var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)), arc to var(--circle-3-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-middle) var(--circle-4-end), arc to calc(var(--circle-2-middle) - var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-1-middle) - var(--angle-quart)) calc(var(--circle-2-middle) + var(--angle-quart)), arc to calc(var(--circle-1-middle) - var(--angle-half)) calc(var(--circle-2-middle) - var(--angle-half)) of var(--circle-quart) var(--circle-quart) cw, line to calc(var(--circle-3-middle) - var(--angle-quart)) calc(var(--circle-1-middle) - var(--angle-quart)), arc to calc(var(--circle-3-middle) + var(--angle-half)) calc(var(--circle-1-middle) - var(--angle-half)) of var(--circle-quart) var(--circle-quart) cw, arc to var(--circle-3-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-4-middle) var(--circle-2-start) of var(--circle-size) var(--circle-size) ccw, line to var(--circle-4-middle) var(--circle-2-start), arc to var(--circle-4-end) var(--circle-2-middle) of var(--circle-quart) var(--circle-quart) cw, line to var(--circle-3-end) var(--circle-2-middle), arc to var(--circle-3-middle) var(--circle-2-start) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-2-middle) var(--circle-2-start), arc to var(--circle-2-start) var(--circle-2-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-2-start) var(--circle-3-middle), arc to var(--circle-2-middle) var(--circle-3-end) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-3-middle) var(--circle-3-end), arc to var(--circle-3-end) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-3-end) var(--circle-2-middle), close);
}

/* M / m */
.hofmann-loader-wrapper [data-char=M],
.hofmann-loader-wrapper [data-char=m] {
  --circles: 5;
}
.hofmann-loader-wrapper [data-char=M]:after,
.hofmann-loader-wrapper [data-char=m]:after {
  clip-path: shape(from var(--circle-1-start) var(--circle-1-middle), arc to var(--circle-1-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-1-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-2-middle) + var(--angle-half)) calc(var(--circle-2-middle) - var(--angle-half)), arc to var(--circle-2-end) var(--circle-2-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-3-start) var(--circle-3-middle), arc to var(--circle-3-end) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-4-start) var(--circle-2-middle), arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-2-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-5-middle) - var(--angle-half)) calc(var(--circle-1-middle) - var(--angle-half)), arc to var(--circle-5-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-5-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-5-end) var(--circle-4-middle), arc to var(--circle-5-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-4-end) var(--circle-3-middle), arc to var(--circle-4-start) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-3-end) var(--circle-4-middle), arc to var(--circle-3-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-end) var(--circle-3-middle), arc to var(--circle-2-start) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-1-end) var(--circle-4-middle), arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-1-start) var(--circle-1-middle), close);
}

/* I / i */
.hofmann-loader-wrapper [data-char=I]:after,
.hofmann-loader-wrapper [data-char=i]:after {
  clip-path: shape(from var(--circle-2-middle) var(--circle-1-start), line to var(--circle-3-middle) var(--circle-1-start), arc to var(--circle-3-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-3-end) var(--circle-2-middle), arc to calc(var(--circle-3-middle) - var(--angle-half)) calc(var(--circle-2-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-3-middle) + var(--angle-half)) calc(var(--circle-3-middle) - var(--angle-half)), arc to var(--circle-3-end) var(--circle-3-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-3-end) var(--circle-4-middle), arc to var(--circle-3-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-middle) var(--circle-4-end), arc to var(--circle-2-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-start) var(--circle-3-middle), arc to calc(var(--circle-2-middle) + var(--angle-half)) calc(var(--circle-3-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-2-middle) - var(--angle-half)) calc(var(--circle-2-middle) + var(--angle-half)), arc to var(--circle-2-start) var(--circle-2-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-start) var(--circle-1-middle), arc to var(--circle-2-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, close);
}

/* L / l */
.hofmann-loader-wrapper [data-char=L]:after,
.hofmann-loader-wrapper [data-char=l]:after {
  clip-path: shape(from var(--circle-1-middle) var(--circle-1-start), line to var(--circle-2-middle) var(--circle-1-start), arc to var(--circle-2-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-end) var(--circle-3-middle), arc to calc(var(--circle-2-middle) + var(--angle-half)) calc(var(--circle-3-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-3-middle) + var(--angle-half)) calc(var(--circle-3-middle) - var(--angle-half)), arc to var(--circle-4-middle) var(--circle-3-start) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-4-end) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-4-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, line to var(--circle-1-middle) var(--circle-4-end), arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-1-start) var(--circle-1-middle), arc to var(--circle-1-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, close);
}

/* B / b */
.hofmann-loader-wrapper [data-char=B]:after,
.hofmann-loader-wrapper [data-char=b]:after {
  clip-path: shape(from var(--circle-1-middle) var(--circle-1-start), line to var(--circle-3-middle) var(--circle-1-start), arc to var(--circle-4-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-4-end) var(--circle-2-start), arc to var(--circle-3-middle) var(--circle-2-end) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-4-end) var(--circle-3-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-4-end) var(--circle-4-start), arc to var(--circle-3-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, line to var(--circle-1-middle) var(--circle-4-end), arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-1-start) var(--circle-1-middle), arc to var(--circle-1-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-middle) var(--circle-2-start), arc to var(--circle-3-middle) var(--circle-2-start) of var(--circle-half) var(--circle-half) ccw, arc to var(--circle-2-middle) var(--circle-2-end) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-2-middle) var(--circle-3-start), arc to var(--circle-3-middle) var(--circle-3-start) of var(--circle-half) var(--circle-half) ccw, arc to var(--circle-2-middle) var(--circle-4-start) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-2-middle) var(--circle-2-start), close);
}

/* S / s */
.hofmann-loader-wrapper [data-char=S]:after,
.hofmann-loader-wrapper [data-char=s]:after {
  clip-path: shape(from var(--circle-2-middle) var(--circle-1-start), line to var(--circle-4-middle) var(--circle-1-start), arc to var(--circle-4-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-2-middle) var(--circle-2-end) of var(--circle-half) var(--circle-half) cw, line to var(--circle-3-middle) var(--circle-3-start), arc to var(--circle-4-end) var(--circle-3-end) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-3-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, line to var(--circle-1-middle) var(--circle-4-end), arc to var(--circle-1-start) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-3-middle) var(--circle-3-start) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-middle) var(--circle-2-end), arc to var(--circle-1-start) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-2-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, close);
}

/* H / h */
.hofmann-loader-wrapper [data-char=H]:after,
.hofmann-loader-wrapper [data-char=h]:after {
  clip-path: shape(from var(--circle-1-middle) var(--circle-1-start), arc to var(--circle-1-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, line to var(--circle-2-start) var(--circle-2-middle), arc to var(--circle-2-middle) var(--circle-2-end) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-3-middle) var(--circle-2-end), arc to var(--circle-3-end) var(--circle-2-middle) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-4-start) var(--circle-1-middle), arc to var(--circle-4-end) var(--circle-1-middle) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-4-middle) + var(--angle-quart)) calc(var(--circle-1-middle) + var(--angle-quart)) of var(--circle-quart) var(--circle-quart) cw, line to var(--circle-4-start) var(--circle-3-middle), arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-3-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-4-middle) + var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)), arc to var(--circle-4-end) var(--circle-4-middle) of var(--circle-half) var(--circle-half) cw, arc to var(--circle-4-middle) var(--circle-4-end) of var(--circle-half) var(--circle-half) cw, arc to calc(var(--circle-4-middle) - var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-3-middle) + var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)), arc to var(--circle-3-middle) var(--circle-4-start) of var(--circle-half) var(--circle-half) ccw, line to var(--circle-2-middle) var(--circle-4-start), arc to calc(var(--circle-2-middle) - var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-4-middle) + var(--angle-half)), arc to calc(var(--circle-1-middle) - var(--angle-half)) calc(var(--circle-4-middle) - var(--angle-half)) of var(--circle-half) var(--circle-half) cw, line to calc(var(--circle-1-middle) + var(--angle-half)) calc(var(--circle-3-middle) + var(--angle-half)), arc to var(--circle-1-end) var(--circle-3-middle) of var(--circle-half) var(--circle-half) ccw, line to calc(var(--circle-1-middle) - var(--angle-quart)) calc(var(--circle-1-middle) + var(--angle-quart)), arc to var(--circle-1-start) var(--circle-1-middle) of var(--circle-quart) var(--circle-quart) cw, arc to var(--circle-1-middle) var(--circle-1-start) of var(--circle-half) var(--circle-half) cw, close);
}
`;
