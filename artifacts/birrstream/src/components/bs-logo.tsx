import logoNaomi from "@/assets/decor/LogoNaomi.jpg";

export function BSLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1 select-none pointer-events-none ${className}`}>
      <img
        src={logoNaomi}
        alt="Naomi Labs"
        className="w-10 h-10 object-contain flex-shrink-0 border border-black"
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
