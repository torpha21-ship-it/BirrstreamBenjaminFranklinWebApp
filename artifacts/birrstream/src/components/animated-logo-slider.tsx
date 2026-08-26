import fbDark from "@/assets/dashboard-icons/dark-theme/wired-outline-2540-logo-facebook-hover-draw.png";
import ytDark from "@/assets/dashboard-icons/dark-theme/wired-outline-2547-logo-youtube-hover-pinch.png";
import twitchDark from "@/assets/dashboard-icons/dark-theme/wired-outline-2556-logo-twitch-hover-pinch.png";
import googleDark from "@/assets/dashboard-icons/dark-theme/wired-outline-2557-logo-google-hover-pinch.png";
import telegramDark from "@/assets/dashboard-icons/dark-theme/wired-outline-2559-logo-telegram-hover-pinch.png";
import redditDark from "@/assets/dashboard-icons/dark-theme/wired-outline-2560-logo-reddit-hover-pinch.png";
import indieHackersDark from "@/assets/dashboard-icons/dark-theme/wired-outline-2561-logo-indie-hackers-hover-pinch.png";
import mediumDark from "@/assets/dashboard-icons/dark-theme/wired-outline-2562-logo-medium-hover-pinch.png";
import wechatDark from "@/assets/dashboard-icons/dark-theme/wired-outline-2563-logo-wechat-hover-pinch.png";
import discordDark from "@/assets/dashboard-icons/dark-theme/wired-outline-2566-logo-discord-hover-rotation.png";
import stackOverflowDark from "@/assets/dashboard-icons/dark-theme/wired-outline-2567-logo-stack-overflow-hover-flow.png";
import yelpDark from "@/assets/dashboard-icons/dark-theme/wired-outline-2576-logo-yelp-hover-pinch.png";

import fbLight from "@/assets/dashboard-icons/light-theme/wired-outline-2540-logo-facebook-hover-draw.png";
import ytLight from "@/assets/dashboard-icons/light-theme/wired-outline-2547-logo-youtube-hover-pinch.png";
import twitchLight from "@/assets/dashboard-icons/light-theme/wired-outline-2556-logo-twitch-hover-pinch.png";
import googleLight from "@/assets/dashboard-icons/light-theme/wired-outline-2557-logo-google-hover-pinch.png";
import telegramLight from "@/assets/dashboard-icons/light-theme/wired-outline-2559-logo-telegram-hover-pinch.png";
import redditLight from "@/assets/dashboard-icons/light-theme/wired-outline-2560-logo-reddit-hover-pinch.png";
import indieHackersLight from "@/assets/dashboard-icons/light-theme/wired-outline-2561-logo-indie-hackers-hover-pinch.png";
import mediumLight from "@/assets/dashboard-icons/light-theme/wired-outline-2562-logo-medium-hover-pinch.png";
import wechatLight from "@/assets/dashboard-icons/light-theme/wired-outline-2563-logo-wechat-hover-pinch.png";
import discordLight from "@/assets/dashboard-icons/light-theme/wired-outline-2566-logo-discord-hover-rotation.png";
import stackOverflowLight from "@/assets/dashboard-icons/light-theme/wired-outline-2567-logo-stack-overflow-hover-flow.png";
import yelpLight from "@/assets/dashboard-icons/light-theme/wired-outline-2576-logo-yelp-hover-pinch.png";

const ANIMATED_LOGOS = [
  { name: "Facebook", darkSrc: fbDark, lightSrc: fbLight },
  { name: "YouTube", darkSrc: ytDark, lightSrc: ytLight },
  { name: "Telegram", darkSrc: telegramDark, lightSrc: telegramLight },
  { name: "Google", darkSrc: googleDark, lightSrc: googleLight },
  { name: "Discord", darkSrc: discordDark, lightSrc: discordLight },
  { name: "Twitch", darkSrc: twitchDark, lightSrc: twitchLight },
  { name: "WeChat", darkSrc: wechatDark, lightSrc: wechatLight },
  { name: "Reddit", darkSrc: redditDark, lightSrc: redditLight },
  { name: "Medium", darkSrc: mediumDark, lightSrc: mediumLight },
  { name: "Indie Hackers", darkSrc: indieHackersDark, lightSrc: indieHackersLight },
  { name: "Stack Overflow", darkSrc: stackOverflowDark, lightSrc: stackOverflowLight },
  { name: "Yelp", darkSrc: yelpDark, lightSrc: yelpLight },
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
            className="flex items-center justify-center h-8 w-8 px-1 flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
          >
            {/* Light theme logo (Dark lines) */}
            <img
              src={logo.lightSrc}
              alt={logo.name}
              className="h-7 w-7 object-contain drop-shadow-sm dark:hidden"
              loading="lazy"
            />
            {/* Dark theme logo (White & Light Green lines) */}
            <img
              src={logo.darkSrc}
              alt={logo.name}
              className="h-7 w-7 object-contain drop-shadow-sm hidden dark:block"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
