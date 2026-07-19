import { useState } from "react";
import { useGetAffiliateNetwork, getGetAffiliateNetworkQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, Package } from "lucide-react";
import { Link } from "wouter";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const LEVEL_COLORS = [
  { tab: "Level 1", badge: "bg-primary/10 text-primary", dot: "bg-primary" },
  { tab: "Level 2", badge: "bg-[#C9BDF5] text-[#5B44BE]", dot: "bg-[#5B44BE]" },
  { tab: "Level 3", badge: "bg-[#A8D5B5] text-[#2B7A4B]", dot: "bg-[#2B7A4B]" },
];

export default function AffiliateNetwork() {
  const [activeTab, setActiveTab] = useState(0);
  const { data: network, isLoading } = useGetAffiliateNetwork({ query: { queryKey: getGetAffiliateNetworkQueryKey() } });

  const levels = [network?.level1 ?? [], network?.level2 ?? [], network?.level3 ?? []];
  const currentLevel = levels[activeTab];
  const colors = LEVEL_COLORS[activeTab];

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/referral" className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">Affiliate Network</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 bg-card rounded-2xl p-1 border border-border">
        {LEVEL_COLORS.map((c, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === i ? `${c.badge} shadow-sm` : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.tab} <span className="text-xs">({levels[i].length})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-card rounded-2xl animate-pulse border border-border" />
          ))}
        </div>
      ) : currentLevel.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">No Level {activeTab + 1} members yet</p>
          <p className="text-sm text-muted-foreground mt-1">Share your referral code to grow your network</p>
          <Link href="/referral" className="inline-flex mt-4 px-4 py-2 bg-primary text-white rounded-2xl text-sm font-semibold hover:opacity-90">
            View Referral Code
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {currentLevel.map(member => (
            <div key={member.id} className="bg-card rounded-2xl p-4 border border-border">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${colors.dot}`}>
                    {member.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">@{member.username}</p>
                    <p className="text-xs text-muted-foreground">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full ${member.hasActivePackage ? colors.badge : "bg-muted text-muted-foreground"}`}>
                  {member.hasActivePackage ? "Active" : "No package"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Deposit Volume</p>
                  <p className="font-semibold text-sm text-foreground">{fmt(member.activeDepositAmount)} ETB</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Your Commission</p>
                  <p className="font-semibold text-sm text-primary">{fmt(member.commissionPaid)} ETB</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
