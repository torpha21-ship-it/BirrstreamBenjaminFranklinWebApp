import { useGetReferralInfo, getGetReferralInfoQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, Users, Share2 } from "lucide-react";
import { Link } from "wouter";
import { BSLogo } from "@/components/bs-logo";
import pointingHand from "@/assets/decor/pointing-hand.webp";

export default function Referral() {
  const { toast } = useToast();
  const { data: info, isLoading } = useGetReferralInfo({ query: { queryKey: getGetReferralInfoQueryKey() } });

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!` });
  };

  return (
    <div className="px-4 pt-0 pb-6 max-w-md mx-auto">
      {/* Centred brand mark — no gap above or below */}
      <div className="flex justify-center mb-0">
        <BSLogo />
      </div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">Referral Program</h1>
      </div>

      {/* Stats banner */}
      <div className="bg-[#1A1A1A] rounded-3xl p-5 mb-5 text-white relative overflow-hidden">
        <img src={pointingHand} alt="" aria-hidden="true" className="absolute right-0 top-0 h-1/2 object-contain object-right-top pointer-events-none select-none opacity-90" />
        <div className="relative z-10">
        <p className="text-gray-400 text-sm mb-3">Your network size</p>
        <p className="text-4xl font-bold">{info?.totalNetworkSize ?? 0}</p>
        <p className="text-gray-400 text-sm">total members</p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "Level 1", value: info?.level1Count ?? 0, color: "bg-primary/20 text-primary" },
            { label: "Level 2", value: info?.level2Count ?? 0, color: "bg-[#C9BDF5]/20 text-[#C9BDF5]" },
            { label: "Level 3", value: info?.level3Count ?? 0, color: "bg-[#A8D5B5]/20 text-[#A8D5B5]" },
          ].map(stat => (
            <div key={stat.label} className={`${stat.color} rounded-2xl p-3 text-center`}>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs opacity-70">{stat.label}</p>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Commissions earned */}
      <div className="bg-[#A8D5B5] rounded-2xl p-4 mb-5">
        <p className="text-[#2B7A4B] text-sm font-semibold">Total Commissions Earned</p>
        <p className="text-[#2B7A4B] text-2xl font-bold mt-1">
          {(info?.totalCommissionsEarned ?? 0).toLocaleString("en-ET", { minimumFractionDigits: 2 })} ETB
        </p>
      </div>

      {/* Referral Code */}
      <div className="bg-card rounded-3xl p-5 border border-border mb-4">
        <p className="text-sm font-semibold text-muted-foreground mb-3">Your Referral Code</p>
        <div className="flex items-center justify-between bg-background rounded-2xl px-4 py-3 border border-border">
          <span className="font-mono font-bold text-xl text-foreground tracking-widest">
            {isLoading ? "••••••" : info?.referralCode}
          </span>
          <button
            onClick={() => info?.referralCode && copy(info.referralCode, "Referral code")}
            className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <Copy className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-card rounded-3xl p-5 border border-border mb-4">
        <p className="text-sm font-semibold text-muted-foreground mb-3">Referral Link</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-background rounded-2xl px-4 py-3 border border-border overflow-hidden">
            <p className="text-xs text-muted-foreground truncate">{info?.referralLink}</p>
          </div>
          <button
            onClick={() => info?.referralLink && copy(info.referralLink, "Referral link")}
            className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center hover:bg-primary/20 flex-shrink-0"
          >
            <Copy className="w-4 h-4 text-primary" />
          </button>
        </div>
        {navigator.share && (
          <button
            onClick={() => info?.referralLink && navigator.share({ title: "BirrStream", url: info.referralLink })}
            className="w-full mt-3 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Share2 className="w-4 h-4" />
            Share Referral Link
          </button>
        )}
      </div>

      {/* Navigate to network */}
      <Link href="/affiliate-network" className="flex items-center justify-between bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">View Affiliate Network</p>
            <p className="text-xs text-muted-foreground">See your 3-tier downline</p>
          </div>
        </div>
        <span className="text-muted-foreground text-lg">›</span>
      </Link>
    </div>
  );
}
