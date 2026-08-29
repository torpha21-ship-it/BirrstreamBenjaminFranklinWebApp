import { useState } from "react";
import { useSubmitDeposit, useListDeposits, getListDepositsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Clock, CheckCircle2, XCircle, X } from "lucide-react";
import { Link } from "wouter";
import { BSLogo } from "@/components/bs-logo";
import { useLanguage } from "@/context/language-context";

export default function Deposit() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { t, isAmharic, isOromo, currency } = useLanguage();
  const [amount, setAmount] = useState("");
  const [senderName, setSenderName] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const submitMutation = useSubmitDeposit();
  const { data: deposits } = useListDeposits({ query: { queryKey: getListDepositsQueryKey() } });

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Plus Jakarta Sans', sans-serif",
    letterSpacing: isAmharic ? "0" : "-0.01em",
  };

  const STATUS_CONFIG = {
    pending: { icon: Clock, color: "text-[#D4B61B]", bg: "bg-[#F5E6A3]", label: isAmharic ? "በመጠባበቅ ላይ" : isOromo ? "Eeggamaa jira" : "Pending" },
    approved: { icon: CheckCircle2, color: "text-[#2B7A4B]", bg: "bg-[#A8D5B5]", label: isAmharic ? "ተቀባይነት አግኝቷል" : isOromo ? "Fudhatama argateera" : "Approved" },
    rejected: { icon: XCircle, color: "text-[#C0402E]", bg: "bg-[#F2A89A]", label: isAmharic ? "ውድቅ ተደርጓል" : isOromo ? "Kukufameera" : "Rejected" },
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setReceipt(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 500 || amountNum > 50000) {
      toast({
        title: isAmharic ? "ትክክለኛ ያልሆነ የብር መጠን" : isOromo ? "Hamma Qarshii dogoggoraa" : "Invalid amount",
        description: isAmharic
          ? "የብር መጠን ከ 500 እስከ 50,000 ብር መሆን አለበት"
          : isOromo
          ? `Hammi qarshii 500 hanga 50,000 ${currency} ta'uu qaba`
          : "Amount must be between 500 and 50,000 ETB",
        variant: "destructive"
      });
      return;
    }
    submitMutation.mutate(
      { data: { amount: amountNum, senderName, receiptBase64: receipt } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListDepositsQueryKey() });
          toast({
            title: isAmharic ? "ተቀማጩ በተሳካ ሁኔታ ገብቷል!" : isOromo ? "Galchi milkaa'inaan dhiyaateera!" : "Deposit submitted!",
            description: isAmharic
              ? "አስተዳዳሪው በ 24 ሰዓታት ውስጥ አይቶ ያረጋግጣል።"
              : isOromo
              ? "Bulchaan sa'aatii 24 keessatti ilaalee mirkaneessa."
              : "Admin will review and approve within 24 hours."
          });
          setAmount(""); setSenderName(""); setReceipt(null);
        },
        onError: () => toast({
          title: isAmharic ? "ማስገባት አልተሳካም" : isOromo ? "Galchuun hin milkoofne" : "Submission failed",
          variant: "destructive"
        }),
      }
    );
  };

  return (
    <div className="px-4 pt-0 pb-6 max-w-md mx-auto">
      {/* Centred brand mark */}
      <div className="flex justify-center mb-0">
        <BSLogo />
      </div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-foreground" style={displayFont}>
          {t("deposit.title")}
        </h1>
      </div>

      {/* Telebirr Instructions */}
      <div className="bg-[#1A1A1A] rounded-3xl p-5 mb-5 text-white">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3" style={displayFont}>
          {isAmharic ? "የቴሌብር አከፋፈል መመሪያ" : isOromo ? "Qajeelfama Kaffaltii Telebirr" : "Telebirr Payment Instructions"}
        </p>
        <div className="space-y-2 text-sm" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{isAmharic ? "የመክፈያ ዘዴ" : isOromo ? "Mala Kaffaltii" : "Payment Method"}</span>
            <span className="font-bold text-primary">Telebirr</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{isAmharic ? "የተቀባይ ስም" : isOromo ? "Maqaa Fudhataa" : "Recipient Name"}</span>
            <span className="font-bold">MUHIDDIN</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{isAmharic ? "ዝቅተኛ መጠን" : isOromo ? "Hamma Xiqqaa" : "Min Amount"}</span>
            <span className="font-bold">500 {currency}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{isAmharic ? "ከፍተኛ መጠን" : isOromo ? "Hamma Guddaa" : "Max Amount"}</span>
            <span className="font-bold">50,000 {currency}</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-primary/20 rounded-2xl">
          <p className="text-primary text-xs" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
            {isAmharic
              ? "የብር መጠኑን ከላይ ወዳለው የቴሌብር ሂሳብ ያስተላልፉ እና ደረሰኙን ከታች ይላኩ።"
              : isOromo
              ? "Hamma Qarshii herrega Telebirr armaan oliitti ergaatii nagahee armaan gaditti galchaa."
              : "Transfer the ETB amount to the Telebirr account above, then submit your receipt below for verification."}
          </p>
        </div>
      </div>

      {/* Form */}
      <div id="tut-deposit-form" className="bg-card rounded-3xl p-5 border border-border mb-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2" style={displayFont}>
              {isAmharic ? "የተቀማጭ ብር መጠን (ብር)" : isOromo ? "Hamma Qarshii Galfamu (Qarshii)" : "Deposit Amount (ETB)"}
            </label>
            <input
              type="number"
              min="500" max="50000" step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="500 — 50,000"
              required
              className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2" style={displayFont}>
              {isAmharic ? "የላኪው ሙሉ ስም" : isOromo ? "Maqaa Guutuu Ergaa" : "Sender's Full Name"}
            </label>
            <input
              type="text"
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
              placeholder={isAmharic ? "በቴሌብር ያስተላለፉበት ስም" : isOromo ? "Maqaa Telebirriin ittiin dabarsitan" : "Name used for Telebirr transfer"}
              required
              className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2" style={displayFont}>
              {isAmharic ? "የደረሰኝ ፎቶ ጫን" : isOromo ? "Nagahee Kaffaltii Fe'aa" : "Upload Receipt"}
            </label>
            {receipt ? (
              <div className="relative rounded-2xl overflow-hidden border border-primary/40 bg-black/5">
                <img src={receipt} alt="Receipt preview" className="w-full max-h-52 object-contain" />
                <button
                  type="button"
                  onClick={() => setReceipt(null)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                  <span className="text-xs text-white font-semibold" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                    {isAmharic ? "✓ ደረሰኝ ተዘጋጅቷል — ለመቀየር × ይጫኑ" : isOromo ? "✓ Nagaheen qophaa'eera — jijjiiruuf × tuqaa" : "✓ Receipt ready — tap × to replace"}
                  </span>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-border hover:border-primary/50 rounded-2xl cursor-pointer transition-colors">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                  {isAmharic ? "የደረሰኝ ስክሪንሾት ለመጫን ይጫኑ" : isOromo ? "Iskiriinshootii nagahee fe'uuf tuqaa" : "Tap to upload receipt screenshot"}
                </span>
              </label>
            )}
          </div>
          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            style={displayFont}
          >
            {submitMutation.isPending
              ? (isAmharic ? "በማስገባት ላይ..." : isOromo ? "Galchaa jira..." : "Submitting...")
              : (isAmharic ? "የተቀማጭ ጥያቄውን አስገባ" : isOromo ? "Gaaffii Galchaa Ergaa" : "Submit Deposit Request")}
          </button>
        </form>
      </div>

      {/* Deposit History */}
      {deposits && deposits.length > 0 && (
        <div>
          <h2 className="font-bold text-foreground mb-3" style={displayFont}>
            {isAmharic ? "የቅርብ ጊዜ ተቀማጮች" : isOromo ? "Galfamtoota Dhihoo" : "Recent Deposits"}
          </h2>
          <div className="space-y-3">
            {deposits.slice(0, 5).map(dep => {
              const cfg = STATUS_CONFIG[dep.status as keyof typeof STATUS_CONFIG];
              const Icon = cfg?.icon ?? Clock;
              return (
                <div key={dep.id} className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg?.bg}`}>
                      <Icon className={`w-4 h-4 ${cfg?.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{dep.amount.toLocaleString()} {currency}</p>
                      <p className="text-xs text-muted-foreground" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                        {new Date(dep.createdAt).toLocaleDateString(isAmharic ? "am-ET" : isOromo ? "om-ET" : "en-ET")}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg?.bg} ${cfg?.color}`} style={displayFont}>
                    {cfg?.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
