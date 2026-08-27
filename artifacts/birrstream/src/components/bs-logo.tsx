import logoNaomi from "@/assets/decor/LogoNaomi.jpg";

export function BSLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 select-none pointer-events-none ${className}`}>
      <img
        src={logoNaomi}
        alt="Naomi Labs"
        className="h-10 w-auto object-cover flex-shrink-0"
      />
      <span
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "20px",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
        className="text-foreground font-normal"
      >
        Naomi Labs
      </span>
    </div>
  );
}
