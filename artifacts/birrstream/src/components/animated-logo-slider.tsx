import fbLogo from "@/assets/dashboard-icons/static/wired-outline-2540-logo-facebook-hover-draw.png";
import ytLogo from "@/assets/dashboard-icons/static/wired-outline-2547-logo-youtube-hover-pinch.png";
import twitchLogo from "@/assets/dashboard-icons/static/wired-outline-2556-logo-twitch-hover-pinch.png";
import googleLogo from "@/assets/dashboard-icons/static/wired-outline-2557-logo-google-hover-pinch.png";
import telegramLogo from "@/assets/dashboard-icons/static/wired-outline-2559-logo-telegram-hover-pinch.png";
import redditLogo from "@/assets/dashboard-icons/static/wired-outline-2560-logo-reddit-hover-pinch.png";
import indieHackersLogo from "@/assets/dashboard-icons/static/wired-outline-2561-logo-indie-hackers-hover-pinch.png";
import mediumLogo from "@/assets/dashboard-icons/static/wired-outline-2562-logo-medium-hover-pinch.png";
import discordLogo from "@/assets/dashboard-icons/static/wired-outline-2566-logo-discord-hover-rotation.png";
import stackOverflowLogo from "@/assets/dashboard-icons/static/wired-outline-2567-logo-stack-overflow-hover-flow.png";
import yelpLogo from "@/assets/dashboard-icons/static/wired-outline-2576-logo-yelp-hover-pinch.png";

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
