import fbLogo from "@/assets/custom-logos/wired-outline-2540-logo-facebook-hover-draw.webp";
import ytLogo from "@/assets/custom-logos/wired-outline-2547-logo-youtube-hover-pinch.webp";
import twitchLogo from "@/assets/custom-logos/wired-outline-2556-logo-twitch-hover-pinch.webp";
import googleLogo from "@/assets/custom-logos/wired-outline-2557-logo-google-hover-pinch.webp";
import telegramLogo from "@/assets/custom-logos/wired-outline-2559-logo-telegram-hover-pinch.webp";
import redditLogo from "@/assets/custom-logos/wired-outline-2560-logo-reddit-hover-pinch.webp";
import indieHackersLogo from "@/assets/custom-logos/wired-outline-2561-logo-indie-hackers-hover-pinch.webp";
import mediumLogo from "@/assets/custom-logos/wired-outline-2562-logo-medium-hover-pinch.webp";
import discordLogo from "@/assets/custom-logos/wired-outline-2566-logo-discord-hover-rotation.webp";
import stackOverflowLogo from "@/assets/custom-logos/wired-outline-2567-logo-stack-overflow-hover-flow.webp";
import yelpLogo from "@/assets/custom-logos/wired-outline-2576-logo-yelp-hover-pinch.webp";

const ANIMATED_LOGOS = [
  { name: "Facebook", src: fbLogo },
  { name: "YouTube", src: ytLogo },
  { name: "Telegram", src: telegramLogo },
  { name: "Google", src: googleLogo },
  { name: "Discord", src: discordLogo },
  { name: "Twitch", src: twitchLogo },
  { name: "Reddit", src: redditLogo },
  { name: "Medium", src: mediumLogo },
  { name: "Indie Hackers", src: indieHackersLogo },
  { name: "Stack Overflow", src: stackOverflowLogo },
  { name: "Yelp", src: yelpLogo },
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
            <img
              src={logo.src}
              alt={logo.name}
              className="h-7 w-7 object-contain drop-shadow-sm"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
