import upperScreen from "@/assets/decor/transaction-history-bg.svg";

export function UpperScreenBg() {
  return (
    <img
      src={upperScreen}
      alt=""
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 w-full max-w-md mx-auto md:max-w-none md:left-64 md:w-[calc(100%-16rem)] h-40 object-cover object-top pointer-events-none select-none z-0"
    />
  );
}
