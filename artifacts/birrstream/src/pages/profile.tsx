import { useState, useRef, useEffect } from "react";
import { useGetUserProfile, getGetUserProfileQueryKey, useLogout } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Trash2, ChevronRight, LogOut, ArrowLeft, Camera, ShieldAlert, ShieldCheck, CheckCircle2, X, UploadCloud, FileText } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { BSLogo } from "@/components/bs-logo";
import { useProfilePhoto } from "@/hooks/use-profile-photo";
import { useLanguage } from "@/context/language-context";
import mainBalanceIcon from "@/assets/decor/profile-main-balance-card.svg";
import depositedIcon from "@/assets/decor/profile-deposited-card.svg";
import totalYieldIcon from "@/assets/decor/profile-total-yield-card.svg";
import withdrawnIcon from "@/assets/decor/profile-withdrawn-card.svg";
import hand2 from "@/assets/decor/member-hand-2.svg";
import hand1 from "@/assets/decor/member-hand-1.svg";
import { CalendarCard } from "@/components/calendar-card";

import withdrawalSettingsIcon from "@/assets/profile-icons/wired-outline-409-wrench-hover-oscillate.webp";
import transactionHistoryIcon from "@/assets/profile-icons/wired-outline-948-Transaction History.webp";
import referralIcon from "@/assets/profile-icons/My Referal Network.webp";
import affiliateIcon from "@/assets/profile-icons/wired-outline-2723-logo-linktree-hover-pinch.webp";
import vipUpgradeIcon from "@/assets/profile-icons/VIP Upgrade Goals.webp";
import warningTriangleIcon from "@/assets/decor/wired-outline-1140-warning-triangle-hover-enlarge.webp";

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  const { data: profile } = useGetUserProfile({ query: { queryKey: getGetUserProfileQueryKey() } });
  const logoutMutation = useLogout();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const kycFileInputRef = useRef<HTMLInputElement>(null);
  const { t, isAmharic, isOromo, currency } = useLanguage();

  // KYC Verification state
  const [kycIdType, setKycIdType] = useState<"national" | "university">("national");
  const [kycImage, setKycImage] = useState<string | null>(() => {
    return localStorage.getItem("birr_kyc_preview") || null;
  });
  const [kycFileName, setKycFileName] = useState<string>(() => {
    return localStorage.getItem("birr_kyc_filename") || "";
  });
  const [isKycSubmitted, setIsKycSubmitted] = useState<boolean>(() => {
    return localStorage.getItem("birr_kyc_submitted") === "true";
  });
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Plus Jakarta Sans', sans-serif",
    letterSpacing: isAmharic ? "0" : "-0.01em",
  };

  const user = profile ?? authUser;
  const { photo, upload, uploading } = useProfilePhoto((profile as any)?.profilePhoto);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        logout();
        setLocation("/login");
        toast({ title: isAmharic ? "በተሳካ ሁኔታ ወጥተዋል" : isOromo ? "Milkaa'inaan baatan" : "Signed out" });
      },
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await upload(file);
      qc.invalidateQueries({ queryKey: getGetUserProfileQueryKey() });
      toast({ title: isAmharic ? "የመገለጫ ፎቶ ተዘምኗል!" : isOromo ? "Suuraan piroofaayilii haaromeera!" : "Profile photo updated!" });
    } catch {
      toast({ title: isAmharic ? "ፎቶ መጫን አልተሳካም" : isOromo ? "Suuraa fe'uun hin danda'amne" : "Upload failed", variant: "destructive" });
    }
    e.target.value = "";
  };

  const handleKycFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setKycFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setKycImage(result);
      localStorage.setItem("birr_kyc_preview", result);
      localStorage.setItem("birr_kyc_filename", file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleKycSubmit = () => {
    if (!kycImage) {
      toast({
        title: isAmharic ? "እባክዎ መታወቂያዎን ይስቀሉ" : isOromo ? "Waraqaa eenyummaa galchaa" : "Please attach your ID",
        description: isAmharic ? "የብሔራዊ ወይም የዩኒቨርሲቲ መታወቂያ ፎቶ ማስገባት አለብዎት።" : "Select National or University ID and capture photo.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmittingKyc(true);
    setTimeout(() => {
      setIsSubmittingKyc(false);
      setIsKycSubmitted(true);
      localStorage.setItem("birr_kyc_submitted", "true");
      toast({
        title: isAmharic ? "የ KYC ማረጋገጫ ተልኳል!" : isOromo ? "Mirkaneessi KYC Ergamaera!" : "KYC Submitted Successfully!",
        description: isAmharic ? "ሰነድዎ በአስተዳዳሪው እየተገመገመ ነው።" : isOromo ? "Sanadni keessan gamaaggamaa jira." : "Your document is under review by our security team.",
      });
    }, 900);
  };

  const initials = user?.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "U";

  const sections = [
    {
      title: t("profile.account_section"),
      items: [
        { imgSrc: withdrawalSettingsIcon, label: t("profile.withdrawal_settings"), href: "/withdrawal-settings", color: "bg-[#A8D5B5] text-[#2B7A4B]" },
        { imgSrc: transactionHistoryIcon, label: t("profile.transaction_history"), href: "/transactions", color: "bg-[#C9BDF5] text-[#5B44BE]" },
      ],
    },
    {
      title: t("profile.network_section"),
      items: [
        { imgSrc: referralIcon, label: t("profile.my_referrals"), href: "/referral", color: "bg-[#F5E6A3] text-[#8B7200]" },
        { imgSrc: affiliateIcon, label: t("profile.affiliate_network"), href: "/affiliate-network", color: "bg-primary/10 text-primary" },
        { imgSrc: vipUpgradeIcon, label: t("profile.vip_upgrades"), href: "/vip-upgrades", color: "bg-[#F2A89A] text-[#C0402E]" },
      ],
    },
    {
      title: t("profile.danger_zone"),
      items: [
        { icon: Trash2, label: t("profile.delete_account"), href: "/delete-account", color: "bg-[#F2A89A] text-[#C0402E]" },
      ],
    },
  ];

  return (
    <div className="px-4 pt-0 pb-2 max-w-md mx-auto relative">
      {/* Centred brand mark */}
      <div className="flex justify-center mb-0 relative z-10">
        <BSLogo />
      </div>

      {/* Header row: back | sign-out */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <Link
          href="/dashboard"
          aria-label="Back to dashboard"
          className="w-9 h-9 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-black" />
        </Link>
        <button
          onClick={handleLogout}
          className="ml-auto flex items-center gap-1.5 text-sm text-black hover:text-black transition-colors bg-white rounded-2xl px-3.5 py-2 border border-gray-200 shadow-sm font-bold cursor-pointer"
          style={displayFont}
        >
          <LogOut className="w-4 h-4 text-black" />
          <span className="text-black">{t("profile.sign_out")}</span>
        </button>
      </div>

      {/* Avatar & Name */}
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/25 overflow-hidden">
            {photo
              ? <img src={photo} alt="Profile" className="w-full h-full object-cover" />
              : initials}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            aria-label={uploading ? "Uploading profile photo" : "Upload profile photo"}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md border-2 border-white hover:opacity-90 active:scale-95 transition-all cursor-pointer"
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
          <h2 className="text-2xl font-bold text-foreground" style={displayFont}>{user?.fullName}</h2>
          <p className="text-muted-foreground text-sm">@{user?.username}</p>
          <p className="text-muted-foreground text-xs">{user?.email}</p>
        </div>
      </div>

      {/* ── KYC IDENTITY VERIFICATION SECTION ── */}
      <div id="kyc" className="bg-card rounded-3xl p-5 mb-6 border border-border shadow-sm relative z-10 -mx-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
              <img src={warningTriangleIcon} alt="" className="w-6 h-6 object-contain dark:[filter:invert(1)_hue-rotate(180deg)]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground leading-tight" style={displayFont}>
                {isAmharic ? "የማንነት ማረጋገጫ (KYC)" : isOromo ? "Mirkaneessa Eenyummaa (KYC)" : "KYC Identity Verification"}
              </h3>
              <p className="text-xs text-muted-foreground" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                {isAmharic ? "የመለያዎን ደህንነት እና የገንዘብ ማውጣት ፍቃድ ያረጋግጡ" : isOromo ? "Eenyummaa keessan mirkaneessuun baasii eeggadhaa" : "Verify your identity to enable withdrawals"}
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
              isKycSubmitted
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30"
            }`}
          >
            {isKycSubmitted ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>{isAmharic ? "በግምገማ ላይ" : isOromo ? "Gamaaggama Irra" : "Under Review"}</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3 h-3" />
                <span>{isAmharic ? "ያልተረጋገጠ" : isOromo ? "Hin Mirkanoofne" : "Unverified"}</span>
              </>
            )}
          </span>
        </div>

        {isKycSubmitted && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <p style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
              {isAmharic
                ? "የመታወቂያ ሰነድዎ ደርሶናል፤ የናኦሚ ላብስ ደህንነት ቡድን በማረጋገጥ ላይ ነው።"
                : isOromo
                ? "Sanadni eenyummaa keessan nu ga'eera; gareen nageenyaa gamaaggamaa jira."
                : "Your ID document is submitted and being verified by the security team."}
            </p>
          </div>
        )}

        {/* ID Type Selector */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => setKycIdType("national")}
            className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              kycIdType === "national"
                ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
            }`}
            style={displayFont}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isAmharic ? "ብሔራዊ መታወቂያ" : isOromo ? "Eenyummaa Biyyooleessaa" : "National ID"}</span>
          </button>
          <button
            type="button"
            onClick={() => setKycIdType("university")}
            className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              kycIdType === "university"
                ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
            }`}
            style={displayFont}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isAmharic ? "የዩኒቨርሲቲ መታወቂያ" : isOromo ? "Eenyummaa Yuunivarsitii" : "University ID"}</span>
          </button>
        </div>

        {/* Hidden File Picker */}
        <input
          ref={kycFileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleKycFileChange}
          className="hidden"
        />

        {/* Upload / Capture Dropzone */}
        {!kycImage ? (
          <button
            type="button"
            onClick={() => kycFileInputRef.current?.click()}
            className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 flex flex-col items-center justify-center gap-1.5 transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-foreground" style={displayFont}>
              {isAmharic ? "መታወቂያ ፎቶ አንሳ ወይም ስቀል" : isOromo ? "Suuraa Waraqaa Eenyummaa Kaasi ykn Galchi" : "Capture or Upload ID Photo"}
            </span>
            <span className="text-[11px] text-muted-foreground" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
              {kycIdType === "national"
                ? (isAmharic ? "የብሔራዊ መታወቂያ ፊት ገጽ" : isOromo ? "Fuula dura Waraqaa Eenyummaa Biyyooleessaa" : "Front of National ID")
                : (isAmharic ? "የዩኒቨርሲቲ መታወቂያ ካርድ" : isOromo ? "Kaardii Eenyummaa Yuunivarsitii" : "Student / University ID Card")}
            </span>
          </button>
        ) : (
          <div className="relative rounded-2xl border border-primary/40 bg-muted/20 p-3 flex items-center gap-3 mb-3">
            <img
              src={kycImage}
              alt="ID Preview"
              className="w-14 h-14 rounded-xl object-cover border border-border flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isAmharic ? "መታወቂያ ተያይዟል" : isOromo ? "Waraqaan Eenyummaa Qophaa'eera" : "ID Attached"}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{kycFileName || "id-document.jpg"}</p>
              <button
                type="button"
                onClick={() => kycFileInputRef.current?.click()}
                className="text-[11px] text-primary font-bold hover:underline mt-0.5 cursor-pointer"
              >
                {isAmharic ? "ፎቶ ቀይር" : isOromo ? "Jijjiiri" : "Change photo"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => { setKycImage(null); setKycFileName(""); localStorage.removeItem("birr_kyc_preview"); localStorage.removeItem("birr_kyc_filename"); }}
              className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleKycSubmit}
          disabled={isSubmittingKyc}
          className="w-full mt-3 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          style={displayFont}
        >
          {isSubmittingKyc ? (
            <span>{isAmharic ? "በመላክ ላይ..." : isOromo ? "Ergaa jira..." : "Submitting..."}</span>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>{isKycSubmitted ? (isAmharic ? "የተሻሻለ መታወቂያ ላክ" : isOromo ? "Haaromsi Ergi" : "Update Submitted ID") : (isAmharic ? "ለማረጋገጫ አስገባ" : isOromo ? "Mirkaneessaaf Galchi" : "Submit ID for Verification")}</span>
            </>
          )}
        </button>
      </div>

      {/* ── 6-MONTH PLATFORM CALENDAR & COUNTDOWN ── */}
      <CalendarCard userCreatedAt={user?.createdAt} />

      {/* ── NAOMI LABS MEMBER CARD ── */}
      <div
        className="bg-[#A8D5B5] rounded-3xl mb-6 relative z-10 overflow-hidden -mx-4"
        style={{ minHeight: 136 }}
      >
        <img
          src={hand2}
          alt=""
          aria-hidden="true"
          className="absolute left-0 bottom-0 h-32 w-auto object-contain pointer-events-none select-none"
        />
        <img
          src={hand1}
          alt=""
          aria-hidden="true"
          className="absolute right-0 bottom-0 h-32 w-auto object-contain pointer-events-none select-none"
        />

        <div className="relative z-10 flex flex-col items-center text-center px-14 pt-5 pb-5">
          <p className="text-[#2B7A4B] text-[20px] font-bold uppercase mb-3" style={displayFont}>
            {isAmharic ? "ናኦሚ ላብስ አባል" : isOromo ? "Miseensa Naomi Labs" : "Naomi Labs Member"}
          </p>
          <div className="bg-[#2B7A4B]/15 rounded-2xl px-4 py-2 w-full mb-2">
            <p className="font-bold text-[#2B7A4B] text-[24px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.08em" }}>
              {user?.referralCode ?? "——————"}
            </p>
          </div>
          <p className="text-[#2B7A4B]/80 text-[16px]" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : displayFont}>
            {isAmharic ? "የተመዘገቡበት ቀን፦ " : isOromo ? "Miseensa kan ta'e፦ " : "Member since "}
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(isAmharic ? "am-ET" : isOromo ? "om-ET" : "en-ET") : "—"}
          </p>
        </div>
      </div>

      {/* Balance summary grid */}
      <div className="grid grid-cols-2 gap-3 mb-6 relative z-10 -mx-4">
        {[
          { label: t("profile.main_balance"),  value: user?.mainBalance  ?? 0, color: "bg-[#1A1A1A] text-white",         icon: mainBalanceIcon },
          { label: t("profile.total_yield"),   value: user?.totalYield   ?? 0, color: "bg-[#F5E6A3] text-[#8B7200]",     icon: totalYieldIcon  },
          { label: t("profile.total_deposited"), value: user?.totalDeposited ?? 0, color: "bg-[#C9BDF5] text-[#5B44BE]",   icon: depositedIcon   },
          { label: t("profile.total_withdrawn"), value: user?.totalWithdrawn ?? 0, color: "bg-[#F2A89A] text-[#C0402E]",   icon: withdrawnIcon   },
        ].map(item => (
          <div key={item.label} className={`${item.color} rounded-2xl p-2.5 relative overflow-hidden`}>
            <img
              src={item.icon}
              alt=""
              aria-hidden="true"
              className="absolute -right-2 -bottom-2 h-10 w-10 object-contain pointer-events-none select-none opacity-90"
            />
            <div className="relative z-10">
              <p className="text-[18px] opacity-80 mb-0.5" style={displayFont}>{item.label}</p>
              <p className="text-[14px] font-bold">
                {(item.value as number).toLocaleString("en-ET", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-[10px] opacity-60 font-semibold">{currency}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation sections */}
      {sections.map(section => (
        <div key={section.title} className="mb-5 relative z-10">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
            {section.title}
          </p>
          <div className="bg-card rounded-3xl border border-border overflow-hidden -mx-4">
            {section.items.map((item: any, i: number) => {
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
                      {item.imgSrc
                        ? <img src={item.imgSrc} alt="" className="w-5 h-5 object-contain" />
                        : <Icon className="w-4 h-4" />
                      }
                    </div>
                    <span className="font-semibold text-[22px] text-foreground" style={displayFont}>{item.label}</span>
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
