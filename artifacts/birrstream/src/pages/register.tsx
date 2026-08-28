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

  // Mandatory KYC ID Type & Document State (Only "national" or "university")
  const [idType, setIdType] = useState<"national" | "university">("national");
  const [idImage, setIdImage] = useState<string | null>(null);
  const [idFileName, setIdFileName] = useState<string>("");

  const registerMutation = useRegister();

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Plus Jakarta Sans', sans-serif",
    letterSpacing: isAmharic ? "0" : "-0.01em",
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setIdImage(reader.result as string);
    };
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

    // Enforce mandatory KYC ID submission
    if (!idImage) {
      toast({
        title: isAmharic ? "የማንነት ማረጋገጫ (KYC) ግዴታ ነው" : isOromo ? "Mirkaneessi Eenyummaa (KYC) Dirqama" : "KYC Verification Required",
        description: isAmharic
          ? "እባክዎ የመታወቂያ ዓይነት (ብሔራዊ ወይም የዩኒቨርሲቲ) ይምረጡ እና የመታወቂያ ፎቶዎን ያያይዙ።"
          : isOromo
          ? "Maaloo gosa eenyummaa filadhaa suuraa waraqaa eenyummaa keessanii galchaa."
          : "Please select your ID type (National or University ID) and capture/upload your ID document before creating an account.",
        variant: "destructive"
      });
      return;
    }

    registerMutation.mutate(
      { data: { ...form, referralCode: form.referralCode || null } },
      {
        onSuccess: (data) => {
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

              {/* Document Photo Capture / Upload Area */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />

              {!idImage ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-card/50 flex flex-col items-center justify-center gap-1.5 transition-all text-center group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-foreground" style={displayFont}>
                    {isAmharic ? "መታወቂያ ፎቶ አንሳ ወይም ስቀል" : isOromo ? "Suuraa Waraqaa Eenyummaa Kaasi ykn Galchi" : "Capture or Upload ID Photo"}
                  </span>
                  <span className="text-[11px] text-muted-foreground" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                    {idType === "national"
                      ? (isAmharic ? "የብሔራዊ መታወቂያ ፊት ገጽ" : "Front of National ID")
                      : (isAmharic ? "የዩኒቨርሲቲ መታወቂያ ካርድ" : "Student / University ID Card")}
                  </span>
                </button>
              ) : (
                <div className="relative rounded-2xl border border-primary/40 bg-card p-3 flex items-center gap-3">
                  <img
                    src={idImage}
                    alt="ID Preview"
                    className="w-14 h-14 rounded-xl object-cover border border-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isAmharic ? "መታወቂያ ተያይዟል" : isOromo ? "Waraqaan Eenyummaa Galmeeffameera" : "ID Attached"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{idFileName || "id-document.jpg"}</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] text-primary font-bold hover:underline mt-0.5"
                    >
                      {isAmharic ? "ፎቶ ቀይር" : isOromo ? "Jijjiiri" : "Change photo"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setIdImage(null); setIdFileName(""); }}
                    className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
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

