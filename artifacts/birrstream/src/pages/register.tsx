import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";
import logoNaomi from "@/assets/decor/LogoNaomi.jpg";
import { Camera, Upload, CheckCircle2, ShieldCheck, GraduationCap, CreditCard, X } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { isAmharic, isOromo } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "", username: "", email: "", password: "", confirmPassword: "", referralCode: ""
  });

  // Mandatory KYC ID Type & Dual Document State (Front & Back)
  const [idType, setIdType] = useState<"national" | "university">("national");
  const [idImageFront, setIdImageFront] = useState<string | null>(null);
  const [idFileNameFront, setIdFileNameFront] = useState<string>("");
  const [idImageBack, setIdImageBack] = useState<string | null>(null);
  const [idFileNameBack, setIdFileNameBack] = useState<string>("");

  const fileInputFrontRef = useRef<HTMLInputElement>(null);
  const fileInputBackRef = useRef<HTMLInputElement>(null);

  const registerMutation = useRegister();

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Plus Jakarta Sans', sans-serif",
    letterSpacing: isAmharic ? "0.045em" : "-0.01em",
  };

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFileNameFront(file.name);
    const reader = new FileReader();
    reader.onload = () => setIdImageFront(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFileNameBack(file.name);
    const reader = new FileReader();
    reader.onload = () => setIdImageBack(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast({
        title: isAmharic ? "የይለፍ ቃሎች አይዛመዱም" : isOromo ? "Jechi iccitii wal hin simne" : "Passwords don't match",
        variant: "destructive"
      });
      return;
    }

    // Check if there is already a pending unapproved registration on this device
    const existingPending = localStorage.getItem("birrstream_kyc_latest_pending");
    if (existingPending) {
      try {
        const parsed = JSON.parse(existingPending);
        if (parsed.status === "pending" && parsed.username === form.username) {
          toast({
            title: isAmharic ? "ማረጋገጫ በመጠባበቅ ላይ ነው" : isOromo ? "Mirkaneessi Eeggamaa Jira" : "Verification Pending Approval",
            description: isAmharic
              ? "የቀደመው የማንነት ማረጋገጫዎ ገና እየተገመገመ ነው። እስኪፈቀድ ድረስ ሁለተኛ ምዝገባ ማድረግ አይቻልም።"
              : isOromo
              ? "Waraqaan eenyummaa keessan duraan galchitan gamaaggama irra jira. Hanga mirkanaa'utti galmee lammaffaa hin hayyamamu."
              : "Your previous ID verification submission is still pending approval. You cannot submit another registration until the first is reviewed and approved.",
            variant: "destructive"
          });
          return;
        }
      } catch {
        // ignore
      }
    }

    // Enforce mandatory KYC ID submission — BOTH Front and Back required
    if (!idImageFront || !idImageBack) {
      toast({
        title: isAmharic ? "ሁለቱም የመታወቂያ ገጾች (ፊት እና ጀርባ) ግዴታ ናቸው" : isOromo ? "Fuula lamaan (Fuuldura fi Duuba) Dirqama" : "Both Front & Back of ID Required",
        description: isAmharic
          ? "እባክዎ የመታወቂያዎን የፊት ገጽ እንዲሁም የጀርባ ገጽ ፎቶዎችን አያይዘው ያስገቡ።"
          : isOromo
          ? "Maaloo fuula fuulduraa fi duubaa waraqaa eenyummaa keessanii lamaanuu galchaa."
          : "Please capture or upload BOTH the Front Side and Back Side of your ID document before continuing.",
        variant: "destructive"
      });
      return;
    }

    registerMutation.mutate(
      { data: { ...form, referralCode: form.referralCode || null } },
      {
        onSuccess: (data) => {
          // Save dual KYC record linked to user
          const kycRecord = {
            status: "pending",
            idType,
            frontImage: idImageFront,
            backImage: idImageBack,
            frontFileName: idFileNameFront,
            backFileName: idFileNameBack,
            submittedAt: new Date().toISOString(),
            userId: data.user?.id,
            username: data.user?.username,
          };
          localStorage.setItem(`birrstream_kyc_${data.user?.id}`, JSON.stringify(kycRecord));
          localStorage.setItem(`birrstream_kyc_${data.user?.username}`, JSON.stringify(kycRecord));
          localStorage.setItem("birrstream_kyc_latest_pending", JSON.stringify(kycRecord));
          window.dispatchEvent(new CustomEvent("birr:kyc-updated", { detail: kycRecord }));

          login(data.token, data.user);
          setLocation("/dashboard");
        },
        onError: () => {
          toast({
            title: isAmharic ? "መመዝገብ አልተሳካም" : isOromo ? "Galmeen hin milkoofne" : "Registration failed",
            description: isAmharic ? "የተጠቃሚ ስም ወይም ኢሜይል አስቀድሞ ተይዟል።" : "Username or email may already be in use.",
            variant: "destructive"
          });
        },
      }
    );
  };

  const fields = [
    {
      key: "fullName",
      label: isAmharic ? "ሙሉ ስም" : isOromo ? "Maqaa Guutuu" : "Full Name",
      type: "text",
      placeholder: isAmharic ? "አበበ በቀለ" : "John Doe",
      autoComplete: "name"
    },
    {
      key: "username",
      label: isAmharic ? "የተጠቃሚ ስም" : isOromo ? "Maqaa Fayyadamaa" : "Username",
      type: "text",
      placeholder: "abebe21",
      autoComplete: "username"
    },
    {
      key: "email",
      label: isAmharic ? "ኢሜይል" : isOromo ? "Imeelii" : "Email",
      type: "email",
      placeholder: "abebe@example.com",
      autoComplete: "email"
    },
    {
      key: "password",
      label: isAmharic ? "የይለፍ ቃል" : isOromo ? "Jecha Iccitii" : "Password",
      type: "password",
      placeholder: isAmharic ? "አዲስ የይለፍ ቃል ይፍጠሩ" : "Create a password",
      autoComplete: "new-password"
    },
    {
      key: "confirmPassword",
      label: isAmharic ? "የይለፍ ቃል ያረጋግጡ" : isOromo ? "Jecha Iccitii Mirkaneessi" : "Confirm Password",
      type: "password",
      placeholder: isAmharic ? "የይለፍ ቃልዎን በድጋሚ ያስገቡ" : "Repeat your password",
      autoComplete: "new-password"
    },
    {
      key: "referralCode",
      label: isAmharic ? "የግብዣ ኮድ (አማራጭ)" : isOromo ? "Koodii Afeerraa (filannoo)" : "Referral Code (optional)",
      type: "text",
      placeholder: isAmharic ? "የግብዣ ኮድ ያስገቡ" : "Enter referral code",
      autoComplete: "off"
    },
  ] as const;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background overflow-hidden relative">
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Logo + heading */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-3 shadow-lg shadow-black/30">
              <img src={logoNaomi} alt="Naomi Labs logo" className="w-10 h-10 object-contain" />
            </div>
            <h1
              className="text-3xl text-foreground"
              style={displayFont}
            >
              {isAmharic ? "መለያ ይፍጠሩ" : isOromo ? "Herrega Uumi" : "Create Account"}
            </h1>
            <p
              className="text-muted-foreground mt-1 text-sm"
              style={displayFont}
            >
              {isAmharic ? "ዛሬውኑ ናኦሚ ላብስን ይቀላቀሉ" : isOromo ? "Har'uma Naomi Labsitti dabalamaa" : "Join Naomi Labs today"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            {fields.map(field => (
              <div key={field.key}>
                <label
                  htmlFor={`register-${field.key}`}
                  className="block text-[18px] font-semibold text-foreground mb-1.5"
                  style={displayFont}
                >
                  {field.label}
                </label>
                <input
                  id={`register-${field.key}`}
                  name={field.key}
                  type={field.type}
                  value={form[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  required={field.key !== "referralCode"}
                  className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
                />
              </div>
            ))}

            {/* ── MANDATORY KYC VERIFICATION SECTION ── */}
            <div className="pt-2 border-t border-border mt-5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                <h3 className="text-[19px] font-bold text-foreground" style={displayFont}>
                  {isAmharic ? "የማንነት ማረጋገጫ (ግዴታ)" : isOromo ? "Mirkaneessa Eenyummaa (Dirqama)" : "KYC ID Verification (Mandatory)"}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                {isAmharic
                  ? "ለመመዝገብ መታወቂያዎን ይምረጡ እና ፎቶውን ያስገቡ።"
                  : isOromo
                  ? "Galmaa'uuf gosa waraqaa eenyummaa filadhaa suuraa galchaa."
                  : "Select your ID type and capture/upload your ID document to proceed."}
              </p>

              {/* ID Type Selection (National ID or University ID ONLY) */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setIdType("national")}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                    idType === "national"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <CreditCard className={`w-4 h-4 ${idType === "national" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-xs font-bold text-foreground" style={displayFont}>
                    {isAmharic ? "ብሔራዊ መታወቂያ" : isOromo ? "Eenyummaa Biyyooleessaa" : "National ID"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIdType("university")}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                    idType === "university"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <GraduationCap className={`w-4 h-4 ${idType === "university" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-xs font-bold text-foreground" style={displayFont}>
                    {isAmharic ? "የዩኒቨርሲቲ መታወቂያ" : isOromo ? "Eenyummaa Yuunivarsitii" : "University ID"}
                  </span>
                </button>
              </div>

              {/* Dual Document Photo Capture / Upload Area: Front & Back */}
              <input
                ref={fileInputFrontRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFrontUpload}
                className="hidden"
              />
              <input
                ref={fileInputBackRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleBackUpload}
                className="hidden"
              />

              <div className="space-y-2.5">
                {/* 1. FRONT OF ID */}
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1" style={displayFont}>
                    1. {isAmharic ? "የመታወቂያ ፊት ገጽ" : isOromo ? "Fuula Fuulduraa Waraqaa Eenyummaa" : "Front Side of ID"}
                  </label>
                  {!idImageFront ? (
                    <button
                      type="button"
                      onClick={() => fileInputFrontRef.current?.click()}
                      className="w-full py-3 px-3 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-card/50 flex items-center justify-center gap-2.5 transition-all text-center group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform flex-shrink-0">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-foreground block" style={displayFont}>
                          {isAmharic ? "የፊት ገጽ ፎቶ አንሳ/ስቀል" : isOromo ? "Suuraa Fuulduraa Kaasi" : "Upload Front Side Photo"}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          {idType === "national" ? (isAmharic ? "የብሔራዊ መታወቂያ ፊት" : "National ID front with photo") : (isAmharic ? "የተማሪ መታወቂያ ፊት" : "Student ID front side")}
                        </span>
                      </div>
                    </button>
                  ) : (
                    <div className="relative rounded-2xl border border-primary/40 bg-card p-2.5 flex items-center gap-2.5">
                      <img
                        src={idImageFront}
                        alt="Front ID Preview"
                        className="w-12 h-12 rounded-xl object-cover border border-border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isAmharic ? "የፊት ገጽ ተያይዟል" : isOromo ? "Fuuldurri Galmeeffameera" : "Front Side Attached"}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{idFileNameFront || "id-front.jpg"}</p>
                        <button
                          type="button"
                          onClick={() => fileInputFrontRef.current?.click()}
                          className="text-[10px] text-primary font-bold hover:underline"
                        >
                          {isAmharic ? "ቀይር" : isOromo ? "Jijjiiri" : "Change"}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setIdImageFront(null); setIdFileNameFront(""); }}
                        className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. BACK OF ID */}
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1" style={displayFont}>
                    2. {isAmharic ? "የመታወቂያ ጀርባ ገጽ" : isOromo ? "Fuula Duubaa Waraqaa Eenyummaa" : "Back Side of ID"}
                  </label>
                  {!idImageBack ? (
                    <button
                      type="button"
                      onClick={() => fileInputBackRef.current?.click()}
                      className="w-full py-3 px-3 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-card/50 flex items-center justify-center gap-2.5 transition-all text-center group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform flex-shrink-0">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-foreground block" style={displayFont}>
                          {isAmharic ? "የጀርባ ገጽ ፎቶ አንሳ/ስቀል" : isOromo ? "Suuraa Duubaa Kaasi" : "Upload Back Side Photo"}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          {isAmharic ? "የመታወቂያው የጀርባ ገጽ ማህተም/ኮድ" : "Back side of document with barcode/signature"}
                        </span>
                      </div>
                    </button>
                  ) : (
                    <div className="relative rounded-2xl border border-primary/40 bg-card p-2.5 flex items-center gap-2.5">
                      <img
                        src={idImageBack}
                        alt="Back ID Preview"
                        className="w-12 h-12 rounded-xl object-cover border border-border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isAmharic ? "የጀርባ ገጽ ተያይዟል" : isOromo ? "Duubni Galmeeffameera" : "Back Side Attached"}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{idFileNameBack || "id-back.jpg"}</p>
                        <button
                          type="button"
                          onClick={() => fileInputBackRef.current?.click()}
                          className="text-[10px] text-primary font-bold hover:underline"
                        >
                          {isAmharic ? "ቀይር" : isOromo ? "Jijjiiri" : "Change"}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setIdImageBack(null); setIdFileNameBack(""); }}
                        className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 mt-4 cursor-pointer"
              style={displayFont}
            >
              {registerMutation.isPending
                ? (isAmharic ? "መለያ በመፍጠር ላይ..." : isOromo ? "Herrega uumaa jira..." : "Creating account...")
                : (isAmharic ? "መለያ ፍጠር" : isOromo ? "Herrega Uumi" : "Create Account")}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
            {isAmharic ? "አስቀድመው መለያ አለዎት? " : isOromo ? "Herrega qabduu? " : "Already have an account? "}
            <Link href="/login" className="text-primary font-semibold" style={displayFont}>
              {isAmharic ? "ግባ" : isOromo ? "Seenaa" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

