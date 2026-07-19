import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Bot } from "lucide-react";
import { Link } from "wouter";
import { UpperScreenBg } from "@/components/upper-screen-bg";

interface Message {
  id: string;
  from: "user" | "bot";
  text: string;
  ts: Date;
}

const QUICK_REPLIES = [
  "Why is my withdrawal pending?",
  "How to complete daily tasks?",
  "How does the 40% reserve rule work?",
  "How do I earn referral commissions?",
  "When does my VIP package expire?",
];

const BOT_RESPONSES: Record<string, string> = {
  "Why is my withdrawal pending?": "Withdrawals are reviewed manually by our team within 24 hours. Once approved, funds are sent to your registered bank/wallet. If it's been more than 24 hours, please contact us directly.",
  "How to complete daily tasks?": "Navigate to the Tasks page using the calendar icon in the navigation bar. Tap on any uncompleted task and follow the instructions. Each task earns you a fixed ETB reward credited instantly to your balance.",
  "How does the 40% reserve rule work?": "When you have an active VIP package, you must keep at least 40% of the package cost in your account at all times. For example, a VIP 1 package (500 ETB) requires a minimum balance of 200 ETB. This ensures platform stability.",
  "How do I earn referral commissions?": "Share your unique referral code with others. When they deposit and activate a VIP package, you earn a commission. BirrStream uses a 3-tier commission system — you earn from your direct referrals (Level 1) and their referrals (Levels 2 & 3).",
  "When does my VIP package expire?": "Each VIP package runs for exactly 7 days. You can check your active package's expiry date on the Dashboard or the Packages page. After expiry, you'll need to reinvest to continue earning daily returns.",
};

const DEFAULT_RESPONSE = "Thank you for your question! Our support team will get back to you soon. You can also browse our FAQ by tapping one of the quick-reply buttons above.";

export default function Support() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", from: "bot", text: "Hi! I'm the BirrStream assistant. How can I help you today? Tap a quick question below or type your own.", ts: new Date() },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (text: string, from: "user" | "bot") => {
    setMessages(prev => [...prev, { id: `${Date.now()}-${from}`, from, text, ts: new Date() }]);
  };

  const handleQuickReply = (question: string) => {
    addMessage(question, "user");
    setTimeout(() => {
      addMessage(BOT_RESPONSES[question] ?? DEFAULT_RESPONSE, "bot");
    }, 600);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setInput("");
    addMessage(q, "user");
    setTimeout(() => {
      const response = Object.entries(BOT_RESPONSES).find(([key]) => q.toLowerCase().includes(key.split(" ")[0].toLowerCase()));
      addMessage(response ? response[1] : DEFAULT_RESPONSE, "bot");
    }, 800);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background z-[5]">
      <UpperScreenBg />
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0 relative z-10">
        <Link href="/dashboard" className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-[28px] text-foreground" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>BirrStream Support</p>
            <p className="text-xs text-[#2B7A4B]">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-4 relative z-10">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            {msg.from === "bot" && (
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.from === "user"
                ? "bg-primary text-white rounded-br-sm"
                : "bg-card border border-border text-foreground rounded-bl-sm"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Quick replies after last bot message */}
        {messages[messages.length - 1]?.from === "bot" && (
          <div className="flex flex-wrap gap-2 pl-9">
            {QUICK_REPLIES.map(q => (
              <button
                key={q}
                onClick={() => handleQuickReply(q)}
                className="text-xs px-3 py-2 bg-card border border-border rounded-2xl text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* pb-[112px] = 84px nav clearance + 28px to clear the + button that protrudes above the nav */}
      <div className="px-4 pt-3 pb-[112px] border-t border-border bg-background flex-shrink-0 relative z-10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
          <button
            onClick={handleSend}
            className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center text-white hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
