import { useState } from "react";
import { useDeleteAccount } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/context/language-context";

const CONFIRMATION_TEXT = "DELETE MY ACCOUNT";

export default function DeleteAccount() {
  const [input, setInput] = useState("");
  const { logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const deleteMutation = useDeleteAccount();
  const { t, isAmharic, isOromo } = useLanguage();

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Highstories', sans-serif",
    letterSpacing: isAmharic ? "0" : "0.06em",
  };

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (input !== CONFIRMATION_TEXT) {
      toast({
        title: isAmharic ? "የማረጋገጫ ጽሑፉ ትክክል አይደለም" : isOromo ? "Barreeffamni mirkaneessaa dogoggora" : "Incorrect confirmation text",
        variant: "destructive"
      });
      return;
    }
    deleteMutation.mutate(
      { data: { confirmationText: input } },
      {
        onSuccess: () => {
          logout();
          setLocation("/login");
          toast({ title: isAmharic ? "መለያዎ ተሰርዟል" : isOromo ? "Herregni keessan haqameera" : "Account deleted" });
        },
        onError: () => toast({
          title: isAmharic ? "የማረጋገጫ ጽሑፉ አይዛመድም" : isOromo ? "Barreeffamni mirkaneessaa wal hin simne" : "Confirmation text doesn't match",
          variant: "destructive"
        }),
      }
    );
  };

  const matches = input === CONFIRMATION_TEXT;

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-foreground" style={displayFont}>
          {t("profile.delete_account")}
        </h1>
      </div>

      <div className="bg-[#F2A89A] rounded-3xl p-5 mb-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-[#C0402E] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[#C0402E] mb-1" style={displayFont}>
              {isAmharic ? "ይህ እርምጃ ወደ ኋላ ሊመለስ አይችልም" : isOromo ? "Tarkaanfiin kun duubatti hin deebi'u" : "This action cannot be undone"}
            </p>
            <p className="text-[#C0402E]/80 text-sm" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
              {isAmharic
                ? "መለያዎን መሰረዝ ቀሪ ሂሳብዎን፣ የግብይት ታሪክዎን እና የግብዣ አውታረ መረብዎን ጨምሮ ሁሉንም ውሂብዎን በቋሚነት ያጠፋዋል።"
                : isOromo
                ? "Herrega keessan haquun haftee, seenaa daldalaa fi netwoorkii afeerraa dabalatee daataa keessan hunda dhaabbataan balleessa."
                : "Deleting your account will permanently remove all your data, including your balance, transaction history, and referral network."}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-3xl p-5 border border-border">
        <p className="text-sm text-muted-foreground mb-4" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
          {isAmharic ? "ለማረጋገጥ የሚከተለውን ጽሑፍ ከታች ባለው ሳጥን ውስጥ ይተይቡ፦ " : isOromo ? "Mirkaneessuuf barreeffama armaan gadii galchaa፦ " : "To confirm, type "}
          <span className="font-mono font-bold text-foreground">{CONFIRMATION_TEXT}</span>
        </p>
        <form onSubmit={handleDelete} className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={CONFIRMATION_TEXT}
            className={`w-full px-4 py-3 rounded-2xl bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 text-sm font-mono transition-colors ${
              matches ? "border-[#C0402E] focus:ring-[#C0402E]/30" : "border-border focus:ring-primary/50"
            }`}
          />
          <button
            type="submit"
            disabled={!matches || deleteMutation.isPending}
            className="w-full py-3.5 bg-[#C0402E] text-white rounded-2xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={displayFont}
          >
            {deleteMutation.isPending
              ? (isAmharic ? "በመሰረዝ ላይ..." : isOromo ? "Haqaa jira..." : "Deleting...")
              : (isAmharic ? "መለያዬን በቋሚነት ሰርዝ" : isOromo ? "Herrega Koo Dhaabbataan Haqi" : "Permanently Delete My Account")}
          </button>
        </form>
      </div>
    </div>
  );
}
