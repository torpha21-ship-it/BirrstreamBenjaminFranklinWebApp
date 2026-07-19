import { useRef } from "react";
import { useGetUserProfile, getGetUserProfileQueryKey, useLogout } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Settings2, Receipt, Trash2, ChevronRight, LogOut, ArrowLeft, Camera } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { UpperScreenBg } from "@/components/upper-screen-bg";
import { BSLogo } from "@/components/bs-logo";
import { useProfilePhoto } from "@/hooks/use-profile-photo";
import mainBalanceIcon from "@/assets/decor/profile-main-balance-card.svg";
import depositedIcon from "@/assets/decor/profile-deposited-card.svg";
import totalYieldIcon from "@/assets/decor/profile-total-yield-card.svg";
import withdrawnIcon from "@/assets/decor/profile-withdrawn-card.svg";
// hand2 = "(" shape → left side   |   hand1 = ")" shape → right side
import hand2 from "@/assets/decor/member-hand-2.svg";
import hand1 from "@/assets/decor/member-hand-1.svg";

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  const { data: profile } = useGetUserProfile({ query: { queryKey: getGetUserProfileQueryKey() } });
  const logoutMutation = useLogout();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = profile ?? authUser;
  const { photo, upload, uploading } = useProfilePhoto((profile as any)?.profilePhoto);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        logout();
        setLocation("/login");
        toast({ title: "Signed out" });
      },
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await upload(file);
      qc.invalidateQueries({ queryKey: getGetUserProfileQueryKey() });
      toast({ title: "Profile photo updated!" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    // reset so same file can be picked again
    e.target.value = "";
  };

  const initials = user?.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "U";

  const sections = [
    {
      title: "Account",
      items: [
        { icon: Settings2, label: "Withdrawal Settings", href: "/withdrawal-settings", color: "bg-[#A8D5B5] text-[#2B7A4B]" },
        { icon: Receipt, label: "Transaction History", href: "/transactions", color: "bg-[#C9BDF5] text-[#5B44BE]" },
      ],
    },
    {
      title: "Network",
      items: [
        { icon: ChevronRight, label: "My Referral Code", href: "/referral", color: "bg-[#F5E6A3] text-[#8B7200]" },
        { icon: ChevronRight, label: "Affiliate Network", href: "/affiliate-network", color: "bg-primary/10 text-primary" },
        { icon: ChevronRight, label: "VIP Upgrade Goals", href: "/vip-upgrades", color: "bg-[#F2A89A] text-[#C0402E]" },
      ],
    },
    {
      title: "Danger Zone",
      items: [
        { icon: Trash2, label: "Delete Account", href: "/delete-account", color: "bg-[#F2A89A] text-[#C0402E]" },
      ],
    },
  ];

  return (
    <div className="px-4 pt-0 pb-6 max-w-md mx-auto relative">
      <UpperScreenBg />

      {/* Centred brand mark — no gap above or below */}
      <div className="flex justify-center mb-0 relative z-10">
        <BSLogo />
      </div>

      {/* Header row: back | sign-out */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <Link
          href="/dashboard"
          className="w-9 h-9 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-sm flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <button
          onClick={handleLogout}
          className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors backdrop-blur-md bg-white/40 rounded-2xl px-3 py-2 border border-white/50 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>

      {/* Avatar & Name */}
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="relative flex-shrink-0">
          {/* Avatar circle */}
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/25 overflow-hidden">
            {photo
              ? <img src={photo} alt="Profile" className="w-full h-full object-cover" />
              : initials}
          </div>
          {/* Camera upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md border-2 border-white hover:opacity-90 active:scale-95 transition-all"
          >
            <Camera className="w-3.5 h-3.5 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>{user?.fullName}</h2>
          <p className="text-muted-foreground text-sm">@{user?.username}</p>
          <p className="text-muted-foreground text-xs">{user?.email}</p>
        </div>
      </div>

      {/* ── BIRRSTREAM MEMBER CARD ── */}
      {/*
        The two cartoon-hand SVGs act as left/right holders framing the card content.
          • hand2 (viewBox 0 0 38 84) — concave opens RIGHT  → placed on the LEFT  side
          • hand1 (viewBox 0 0 38 84) — concave opens LEFT   → placed on the RIGHT side
        Both are rendered at h-32 (128 px tall) so they are tall enough to frame the card.
        The content uses px-14 (56 px) horizontal padding, giving ~6 px of clearance
        beyond each hand's ~50 px rendered width.
      */}
      <div
        className="bg-[#A8D5B5] rounded-3xl mb-6 relative z-10 overflow-hidden -mx-4"
        style={{ minHeight: 136 }}
      >
        {/* Left hand — concave opens right, hugs left edge */}
        <img
          src={hand2}
          alt=""
          aria-hidden="true"
          className="absolute left-0 bottom-0 h-32 w-auto object-contain pointer-events-none select-none"
        />
        {/* Right hand — concave opens left, hugs right edge */}
        <img
          src={hand1}
          alt=""
          aria-hidden="true"
          className="absolute right-0 bottom-0 h-32 w-auto object-contain pointer-events-none select-none"
        />

        {/* Centred card content, padded so the hands don't overlap text */}
        <div className="relative z-10 flex flex-col items-center text-center px-14 pt-5 pb-5">
          <p className="text-[#2B7A4B] text-[20px] font-bold uppercase mb-3" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.12em" }}>
            BirrStream Member
          </p>
          <div className="bg-[#2B7A4B]/15 rounded-2xl px-4 py-2 w-full mb-2">
            <p className="font-bold text-[#2B7A4B] text-[28px]" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.15em" }}>
              {user?.referralCode ?? "——————"}
            </p>
          </div>
          <p className="text-[#2B7A4B]/60 text-[20px]" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>
            Member since{" "}
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
          </p>
        </div>
      </div>

      {/* Balance summary grid */}
      <div className="grid grid-cols-2 gap-3 mb-6 relative z-10 -mx-4">
        {[
          { label: "Main Balance",  value: user?.mainBalance  ?? 0, color: "bg-[#1A1A1A] text-white",         icon: mainBalanceIcon },
          { label: "Total Yield",   value: user?.totalYield   ?? 0, color: "bg-[#F5E6A3] text-[#8B7200]",     icon: totalYieldIcon  },
          { label: "Deposited",     value: user?.totalDeposited ?? 0, color: "bg-[#C9BDF5] text-[#5B44BE]",   icon: depositedIcon   },
          { label: "Withdrawn",     value: user?.totalWithdrawn ?? 0, color: "bg-[#F2A89A] text-[#C0402E]",   icon: withdrawnIcon   },
        ].map(item => (
          <div key={item.label} className={`${item.color} rounded-2xl p-2.5 relative overflow-hidden`}>
            <img
              src={item.icon}
              alt=""
              aria-hidden="true"
              className="absolute -right-2 -bottom-2 h-10 w-10 object-contain pointer-events-none select-none opacity-90"
            />
            <div className="relative z-10">
              <p className="text-[20px] opacity-60 mb-0.5" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>{item.label}</p>
              <p className="text-[14px] font-bold">
                {(item.value as number).toLocaleString("en-ET", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-[10px] opacity-50">ETB</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation sections */}
      {sections.map(section => (
        <div key={section.title} className="mb-5 relative z-10">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            {section.title}
          </p>
          <div className="bg-card rounded-3xl border border-border overflow-hidden -mx-4">
            {section.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-4 hover:bg-muted/30 transition-colors ${
                    i < section.items.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-[28px] text-foreground" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
