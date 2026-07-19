import bsLogo from "@/assets/decor/bs-logo.svg";

/**
 * BirrStream brand mark — logo flanked by "BIRR" on the left and "STREAM" on the right.
 * The text uses the Avalon font and is sized to match the logo height without
 * affecting the surrounding layout (the outer div is inline-flex).
 */
export function BSLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1 select-none pointer-events-none ${className}`}>
      <span
        style={{
          fontFamily: "'Highstories', sans-serif",
          fontSize: "22px",
          letterSpacing: "0.12em",
          lineHeight: 1,
        }}
        className="text-foreground font-normal"
      >
        BIRR
      </span>
      <img
        src={bsLogo}
        alt="BirrStream"
        className="w-20 h-20 object-contain flex-shrink-0"
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
        STREAM
      </span>
    </div>
  );
}
