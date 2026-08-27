import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Bot } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/context/language-context";

interface Message {
  id: string;
  from: "user" | "bot";
  text: string;
  ts: Date;
}

const QUICK_REPLIES_EN = [
  "Why is my withdrawal pending?",
  "How to complete daily tasks?",
  "How does the 40% reserve rule work?",
  "How do I earn referral commissions?",
  "When does my VIP package expire?",
];

const QUICK_REPLIES_AM = [
  "የገንዘብ ማውጣት ጥያቄዬ ለምን በመጠባበቅ ላይ ሆነ?",
  "ዕለታዊ ተግባራትን እንዴት ማጠናቀቅ እችላለሁ?",
  "የ 40% የተቀማጭ ደንብ እንዴት ይሰራል?",
  "የግብዣ ኮሚሽን እንዴት ማግኘት እችላለሁ?",
  "የቪአይፒ ፓኬጄ መቼ ያልቃል?",
];

const QUICK_REPLIES_OR = [
  "Gaaffiin baasii koo maaliif eeggamaa jira?",
  "Hojiiwwan guyyaa akkamittiin xumura?",
  "Seerri qusannoo 40% akkamitti hojjeta?",
  "Komishinii afeerraa akkamittiin argadha?",
  "Paakeejiin VIP koo yoom xumurama?",
];

const BOT_RESPONSES_EN: Record<string, string> = {
  "Why is my withdrawal pending?": "Withdrawals are reviewed manually by our team within 24 hours. Once approved, funds are sent to your registered bank/wallet. If it's been more than 24 hours, please contact us directly.",
  "How to complete daily tasks?": "Navigate to the Tasks page using the calendar icon in the navigation bar. Tap on any uncompleted task and follow the instructions. Each task earns you a fixed ETB reward credited instantly to your balance.",
  "How does the 40% reserve rule work?": "When you have an active VIP package, you must keep at least 40% of the package cost in your account at all times. For example, a VIP 1 package (500 ETB) requires a minimum balance of 200 ETB. This ensures platform stability.",
  "How do I earn referral commissions?": "Share your unique referral code with others. When they deposit and activate a VIP package, you earn a commission. Naomi Labs uses a 3-tier commission system — you earn from your direct referrals (Level 1) and their referrals (Levels 2 & 3).",
  "When does my VIP package expire?": "Each VIP package runs for exactly 7 days. You can check your active package's expiry date on the Dashboard or the Packages page. After expiry, you'll need to reinvest to continue earning daily returns.",
};

const BOT_RESPONSES_AM: Record<string, string> = {
  "የገንዘብ ማውጣት ጥያቄዬ ለምን በመጠባበቅ ላይ ሆነ?": "የገንዘብ ማውጣት ጥያቄዎች በቡድናችን በ 24 ሰዓታት ውስጥ በእጅ ይገመገማሉ። ከፀደቀ በኋላ ገንዘቡ ወደ ተመዘገበው የባንክ ሂሳብ ወይም ዋሌት ይላካል። ከ 24 ሰዓታት በላይ ከወሰደ እባክዎን በቀጥታ ያነጋግሩን።",
  "ዕለታዊ ተግባራትን እንዴት ማጠናቀቅ እችላለሁ?": "በታችኛው አሞሌ ላይ ያለውን የካሌንደር ምልክት በመጫን ወደ ተግባራት ገጽ ይሂዱ። ያልተጠናቀቁትን ተግባራት ይጫኑና መመሪያውን ይከተሉ። እያንዳንዱ ተግባር ወዲያውኑ ወደ ቀሪ ሂሳብዎ የሚገባ ቋሚ የብር ሽልማት ያስገኝልዎታል።",
  "የ 40% የተቀማጭ ደንብ እንዴት ይሰራል?": "ንቁ የቪአይፒ ፓኬጅ በሚኖርዎት ጊዜ ሁልጊዜ በሂሳብዎ ውስጥ የፓኬጁን ዋጋ 40% ማስቀረት አለብዎት። ለምሳሌ ቪአይፒ 1 (500 ብር) 200 ብር ዝቅተኛ ቀሪ ሂሳብ ይፈልጋል። ይህም የመድረኩን መረጋጋት ያረጋግጣል።",
  "የግብዣ ኮሚሽን እንዴት ማግኘት እችላለሁ?": "የራስዎን የግብዣ ኮድ ለጓደኞችዎ ያጋሩ። እነሱ ገንዘብ አስገብተው የቪአይፒ ፓኬጅ ሲገዙ ኮሚሽን ያገኛሉ። ናኦሚ ላብስ የ 3 ደረጃ የኮሚሽን ስርአት ይጠቀማል — ከቀጥተኛ ተጋባዦች (ደረጃ 1) እና ከተጋባዦችዎ ተጋባዦች (ደረጃ 2 እና 3) ያገኛሉ።",
  "የቪአይፒ ፓኬጄ መቼ ያልቃል?": "እያንዳንዱ የቪአይፒ ፓኬጅ በትክክል ለ 7 ቀናት ይሰራል። በዳሽቦርዱ ወይም በፓኬጆች ገጽ ላይ የቀረውን ቀን ማየት ይችላሉ። ካለቀ በኋላ ዕለታዊ ገቢ ማግኘቱን ለመቀጠል በድጋሚ መግዛት ያስፈልግዎታል።",
};

const BOT_RESPONSES_OR: Record<string, string> = {
  "Gaaffiin baasii koo maaliif eeggamaa jira?": "Gaaffiiwwan baasii sa'aatii 24 keessatti garee keenyaan to'atamu. Erga fudhatama argatanii booda gara herrega baankii ykn walatii keessanitti ergama. Sa'aatii 24 yoo darbe kallattiin nu qunnamaa.",
  "Hojiiwwan guyyaa akkamittiin xumura?": "Kutaa Hojiiwwan Guyyaa seenuun hojii kamiyyuu banaatii qajeelfama hordofaa. Hojiin xumurame hundi badhaasa Qarshii battalumatti herrega keessanitti dabala.",
  "Seerri qusannoo 40% akkamitti hojjeta?": "Yeroo paakeejii VIP qabdan gatii paakeejichaa keessaa yoo xiqqaate 40% herrega keessan keessa turuu qaba. Fakkeenyaaf, VIP 1 (Qarshii 500) haftee Qarshii 200 barbaada. Kunis tasgabbii sirnichaa mirkaneessa.",
  "Komishinii afeerraa akkamittiin argadha?": "Koodii afeerraa keessan hiriyaa keessaniif qoodaa. Yeroo isaan qarshii galchuun paakeejii VIP bitatan komishinii sadarkaa 3 irraa argattu.",
  "Paakeejiin VIP koo yoom xumurama?": "Paakeejiin VIP hundi guyyoota 7f qofa tajaajila. Guyyoota hafan daashboordii ykn fuula Paakeejotaa irratti ilaaluu dandeessu. Erga xumuramee booda bu'aa itti fufsiisuuf irra deebitanii bitattu.",
};

export default function Support() {
  const { t, isAmharic, isOromo } = useLanguage();
  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Plus Jakarta Sans', sans-serif",
    letterSpacing: isAmharic ? "0" : "-0.01em",
  };

  const welcomeText = isAmharic
    ? "ሰላም! እኔ የናኦሚ ላብስ ረዳት ነኝ። ዛሬ በምን ልርዳዎት? ከታች ካሉት ፈጣን ጥያቄዎች አንዱን ይጫኑ ወይም የራስዎን ጥያቄ ይጻፉ።"
    : isOromo
    ? "Akkam! Ani gargaaraa Naomi Labs ti. Har'a maaliin isin gargaaru? Gaaffiiwwan armaan gadii tuqaa ykn gaaffii keessan barreessaa."
    : "Hi! I'm the Naomi Labs assistant. How can I help you today? Tap a quick question below or type your own.";

  const defaultResponse = isAmharic
    ? "ስለ ጥያቄዎ እናመሰግናለን! የድጋፍ ሰጪ ቡድናችን በቅርቡ ይመልስልዎታል። እንዲሁም ከላይ ያሉትን ፈጣን ጥያቄዎች በመጫን መልሶችን ማየት ይችላሉ።"
    : isOromo
    ? "Gaaffii keessaniif galatoomaa! Gareen deeggarsa keenyaa dhiyootti isiniif deebisa. Gaaffiiwwan yeroo baay'ee gaafataman tuquunis deebii argachuu dandeessu."
    : "Thank you for your question! Our support team will get back to you soon. You can also browse our FAQ by tapping one of the quick-reply buttons above.";

  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", from: "bot", text: welcomeText, ts: new Date() },
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
      const resp = isAmharic
        ? (BOT_RESPONSES_AM[question] ?? defaultResponse)
        : isOromo
        ? (BOT_RESPONSES_OR[question] ?? defaultResponse)
        : (BOT_RESPONSES_EN[question] ?? defaultResponse);
      addMessage(resp, "bot");
    }, 600);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setInput("");
    addMessage(q, "user");
    setTimeout(() => {
      const respDict = isAmharic ? BOT_RESPONSES_AM : isOromo ? BOT_RESPONSES_OR : BOT_RESPONSES_EN;
      const response = Object.entries(respDict).find(([key]) => q.toLowerCase().includes(key.split(" ")[0].toLowerCase()));
      addMessage(response ? response[1] : defaultResponse, "bot");
    }, 800);
  };

  const quickReplies = isAmharic ? QUICK_REPLIES_AM : isOromo ? QUICK_REPLIES_OR : QUICK_REPLIES_EN;

  return (
    <div className="fixed inset-0 flex flex-col bg-background z-[5]">
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
            <p className="font-bold text-base sm:text-lg text-foreground whitespace-nowrap leading-tight" style={displayFont}>
              {isAmharic ? "ናኦሚ ላብስ ድጋፍ" : isOromo ? "Deeggarsa Naomi Labs" : "Naomi Labs Support"}
            </p>
            <p className="text-xs text-[#2B7A4B]" style={displayFont}>
              {isAmharic ? "መስመር ላይ" : isOromo ? "Toora Irra" : "Online"}
            </p>
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
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.from === "user"
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-card border border-border text-foreground rounded-bl-sm"
              }`}
              style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Quick replies after last bot message */}
        {messages[messages.length - 1]?.from === "bot" && (
          <div className="flex flex-wrap gap-2 pl-9">
            {quickReplies.map(q => (
              <button
                key={q}
                onClick={() => handleQuickReply(q)}
                className="text-xs px-3 py-2 bg-card border border-border rounded-2xl text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors text-left"
                style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
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
            placeholder={isAmharic ? "መልዕክት እዚህ ይጻፉ..." : isOromo ? "Ergaa asitti barreessaa..." : "Type a message..."}
            className="flex-1 px-4 py-3 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
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
