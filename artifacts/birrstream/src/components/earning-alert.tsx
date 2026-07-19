import { useEffect, useState } from "react";
import { CheckCircle2, TrendingUp, X, ArrowUpRight, AlertCircle } from "lucide-react";

export type EarningAlertData = {
  id: string;
  type: "yield" | "deposit" | "withdrawal_approved" | "withdrawal_rejected";
  title: string;
  amount: string;
  description: string;
};

const ALERT_STYLES: Record<EarningAlertData["type"], { bg: string; icon: React.ReactNode; amount: string; bar: string }> = {
  yield: {
    bg: "bg-primary/20",
    icon: <TrendingUp className="w-5 h-5 text-primary" />,
    amount: "text-primary",
    bar: "bg-primary",
  },
  deposit: {
    bg: "bg-[#A8D5B5]",
    icon: <CheckCircle2 className="w-5 h-5 text-[#2B7A4B]" />,
    amount: "text-[#A8D5B5]",
    bar: "bg-[#A8D5B5]",
  },
  withdrawal_approved: {
    bg: "bg-[#F5E6A3]",
    icon: <ArrowUpRight className="w-5 h-5 text-[#8B7200]" />,
    amount: "text-[#F5E6A3]",
    bar: "bg-[#F5E6A3]",
  },
  withdrawal_rejected: {
    bg: "bg-[#F2A89A]",
    icon: <AlertCircle className="w-5 h-5 text-[#C0402E]" />,
    amount: "text-[#F2A89A]",
    bar: "bg-[#F2A89A]",
  },
};

export function showEarningAlert(data: Omit<EarningAlertData, "id">) {
  window.dispatchEvent(
    new CustomEvent("birr:earning", { detail: { ...data, id: crypto.randomUUID() } })
  );
}

export function EarningAlertContainer() {
  const [alerts, setAlerts] = useState<EarningAlertData[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const alert = (e as CustomEvent<EarningAlertData>).detail;
      setAlerts(prev => [alert, ...prev].slice(0, 3));
      const timer = setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== alert.id));
      }, 6000);
      return () => clearTimeout(timer);
    };
    window.addEventListener("birr:earning", handler);
    return () => window.removeEventListener("birr:earning", handler);
  }, []);

  const clearBadge = () => window.dispatchEvent(new CustomEvent("birr:clear-badge"));

  const dismiss = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    clearBadge();
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {alerts.map(alert => (
        <div
          key={alert.id}
          onClick={() => dismiss(alert.id)}
          className="w-full max-w-sm pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-300 bg-[#1A1A1A]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden cursor-pointer"
        >
          <div className="flex items-center gap-3 p-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${ALERT_STYLES[alert.type].bg}`}>
              {ALERT_STYLES[alert.type].icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">{alert.title}</p>
              <p className={`text-xl font-black leading-tight ${ALERT_STYLES[alert.type].amount}`}>
                {alert.amount}
              </p>
              <p className="text-gray-400 text-xs mt-0.5 truncate">{alert.description}</p>
            </div>
            <button
              onClick={() => dismiss(alert.id)}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5 text-gray-300" />
            </button>
          </div>
          <div className="h-0.5 bg-white/5">
            <div className={`h-full ${ALERT_STYLES[alert.type].bar} w-full`}
              style={{ animation: "shrinkWidth 6s linear forwards" }}
            />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}
