import { Lottie } from "lottie-react";
import facebookAnim from "@/assets/custom-logos/wired-outline-2540-logo-facebook-hover-draw.json";
import tiktokAnim from "@/assets/custom-logos/wired-outline-2546-logo-tiktok-hover-dots.json";
import youtubeAnim from "@/assets/custom-logos/wired-outline-2547-logo-youtube-hover-pinch.json";
import googleAnim from "@/assets/custom-logos/wired-outline-2557-logo-google-hover-pinch.json";
import telegramAnim from "@/assets/custom-logos/wired-outline-2559-logo-telegram-hover-pinch.json";
import redditAnim from "@/assets/custom-logos/wired-outline-2560-logo-reddit-in-reveal.json";
import wechatAnim from "@/assets/custom-logos/wired-outline-2563-logo-wechat-hover-pinch.json";
import discordAnim from "@/assets/custom-logos/wired-outline-2566-logo-discord-in-reveal.json";

const ANIMATED_LOGOS = [
  { name: "Facebook", animationData: facebookAnim },
  { name: "TikTok", animationData: tiktokAnim },
  { name: "YouTube", animationData: youtubeAnim },
  { name: "Google", animationData: googleAnim },
  { name: "Telegram", animationData: telegramAnim },
  { name: "Reddit", animationData: redditAnim },
  { name: "WeChat", animationData: wechatAnim },
  { name: "Discord", animationData: discordAnim },
];

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
            className="flex items-center justify-center h-8 w-8 px-1 flex-shrink-0 opacity-85"
          >
            <Lottie
              animationData={logo.animationData}
              loop={true}
              autoPlay={true}
              style={{ width: 32, height: 32 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
