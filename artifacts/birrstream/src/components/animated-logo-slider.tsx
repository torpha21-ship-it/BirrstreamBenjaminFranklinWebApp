import { useEffect, useRef } from "react";
import { defineElement } from "@lordicon/element";
import lottie from "lottie-web";

if (typeof window !== "undefined") {
  try {
    defineElement(lottie.loadAnimation);
  } catch (e) {
    // Already defined
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "lord-icon": any;
    }
  }
}

const ANIMATED_LOGOS = [
  { name: "Facebook", src: "/custom-logos/wired-outline-2540-logo-facebook-hover-draw.json", state: "hover-draw", color: "#1877F2" },
  { name: "TikTok", src: "/custom-logos/wired-outline-2546-logo-tiktok-hover-dots.json", state: "hover-dots", color: "#EE1D52" },
  { name: "YouTube", src: "/custom-logos/wired-outline-2547-logo-youtube-hover-pinch.json", state: "hover-pinch", color: "#FF0000" },
  { name: "Google", src: "/custom-logos/wired-outline-2557-logo-google-hover-pinch.json", state: "hover-pinch", color: "#4285F4" },
  { name: "Telegram", src: "/custom-logos/wired-outline-2559-logo-telegram-hover-pinch.json", state: "hover-pinch", color: "#229ED9" },
  { name: "Reddit", src: "/custom-logos/wired-outline-2560-logo-reddit-in-reveal.json", state: "in-reveal", color: "#FF4500" },
  { name: "WeChat", src: "/custom-logos/wired-outline-2563-logo-wechat-hover-pinch.json", state: "hover-pinch", color: "#07C160" },
  { name: "Discord", src: "/custom-logos/wired-outline-2566-logo-discord-in-reveal.json", state: "in-reveal", color: "#5865F2" },
];

function LordIconItem({ src, state, color }: { src: string; state: string; color: string }) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current as any;
    if (el) {
      el.src = src;
      el.trigger = "loop";
      if (state) el.state = state;
      el.colors = `primary:${color},secondary:${color}`;
    }
  }, [src, state, color]);

  return (
    <lord-icon
      ref={ref}
      src={src}
      trigger="loop"
      state={state}
      colors={`primary:${color},secondary:${color}`}
      style={{ width: "34px", height: "34px", display: "inline-block" }}
    />
  );
}

export function AnimatedLogoSlider({ className = "", reverse = false }: { className?: string; reverse?: boolean }) {
  // Duplicate list to achieve a seamless, continuous infinite scroll loop
  const displayLogos = [...ANIMATED_LOGOS, ...ANIMATED_LOGOS];

  return (
    <div className={`relative overflow-hidden py-2.5 select-none ${className}`}>
      {/* Left and Right Fade Edge Vignettes */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />

      {/* Marquee Track */}
      <div className={`${reverse ? "animate-marquee-reverse" : "animate-marquee"} flex items-center gap-8`}>
        {displayLogos.map((logo, idx) => (
          <div
            key={`${logo.name}-${idx}`}
            className="flex items-center justify-center h-9 w-9 px-1 flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity"
          >
            <LordIconItem src={logo.src} state={logo.state} color={logo.color} />
          </div>
        ))}
      </div>
    </div>
  );
}
