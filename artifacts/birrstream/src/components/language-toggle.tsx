import React from "react";
import { useLanguage } from "@/context/language-context";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-full bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 shadow-sm backdrop-blur-md transition-all ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 text-xs rounded-full font-bold transition-all ${
          lang === "en"
            ? "bg-primary text-black shadow-sm scale-105"
            : "text-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
        }`}
        style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}
      >
        EN
      </button>
      <button
        onClick={() => setLang("am")}
        className={`px-2.5 py-1 text-xs rounded-full font-bold transition-all ${
          lang === "am"
            ? "bg-primary text-black shadow-sm scale-105"
            : "text-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
        }`}
        style={{ fontFamily: "'LogaComic', sans-serif" }}
      >
        አማ
      </button>
    </div>
  );
}