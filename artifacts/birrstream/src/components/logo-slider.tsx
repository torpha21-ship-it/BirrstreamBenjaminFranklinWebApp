import amdLogo from "@/assets/partners/amd.png";
import googlePlayLogo from "@/assets/partners/google-play.png";
import nvidiaLogo from "@/assets/partners/nvidia.png";
import redditLogo from "@/assets/partners/reddit.png";
import googleLogo from "@/assets/partners/search.png";
import twitchLogo from "@/assets/partners/twitch.png";
import ubuntuLogo from "@/assets/partners/ubuntu.png";
import zteLogo from "@/assets/partners/zte.png";

const PARTNER_LOGOS = [
  { name: "AMD", src: amdLogo },
  { name: "NVIDIA", src: nvidiaLogo },
  { name: "Google", src: googleLogo },
  { name: "Google Play", src: googlePlayLogo },
  { name: "Ubuntu", src: ubuntuLogo },
  { name: "ZTE", src: zteLogo },
  { name: "Twitch", src: twitchLogo },
  { name: "Reddit", src: redditLogo },
];

export function LogoSlider({ className = "" }: { className?: string }) {
  // Duplicate list to achieve a seamless, continuous infinite scroll loop
  const displayLogos = [...PARTNER_LOGOS, ...PARTNER_LOGOS];

  return (
    <div className={`relative overflow-hidden py-3 select-none ${className}`}>
      {/* Left and Right Fade Edge Vignettes */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />

      {/* Marquee Track */}
      <div className="animate-marquee flex items-center gap-8">
        {displayLogos.map((logo, idx) => (
          <div
            key={`${logo.name}-${idx}`}
            className="flex items-center justify-center h-8 px-2 flex-shrink-0 opacity-75 hover:opacity-100 transition-opacity duration-300"
          >
            <img
              src={logo.src}
              alt={logo.name}
              className="h-6 w-auto max-w-[85px] object-contain drop-shadow-sm"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
