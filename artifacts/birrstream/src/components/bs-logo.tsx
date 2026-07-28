import logoNaomi from "@/assets/decor/LogoNaomi.jpg";

export function BSLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center select-none pointer-events-none ${className}`}>
      <img
        src={logoNaomi}
        alt="Naomi Labs"
        className="h-10 w-auto object-cover flex-shrink-0"
      />
      <span
        style={{
          fontFamily: "'Highstories', sans-serif",
          fontSize: "22px",
          letterSpacing: "0.12em",
          lineHeight: 1,
        }}
        className="text-foreground font-normal"
      >
        Naomi Labs
      </span>
    </div>
  );
}
