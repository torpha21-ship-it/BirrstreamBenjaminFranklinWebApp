import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";
import logoNaomi from "@/assets/decor/LogoNaomi.jpg";

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { isAmharic } = useLanguage();
  const [form, setForm] = useState({
    fullName: "", username: "", email: "", password: "", confirmPassword: "", referralCode: ""
  });
  const registerMutation = useRegister();

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Plus Jakarta Sans', sans-serif",
    letterSpacing: isAmharic ? "0" : "-0.01em",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({
        title: isAmharic ? "የይለፍ ቃሎች አይዛመዱም" : "Passwords don't match",
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
            title: isAmharic ? "መመዝገብ አልተሳካም" : "Registration failed",
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
      label: isAmharic ? "ሙሉ ስም" : "Full Name",
      type: "text",
      placeholder: isAmharic ? "አበበ በቀለ" : "John Doe",
      autoComplete: "name"
    },
    {
      key: "username",
      label: isAmharic ? "የተጠቃሚ ስም" : "Username",
      type: "text",
      placeholder: "abebe21",
      autoComplete: "username"
    },
    {
      key: "email",
      label: isAmharic ? "ኢሜይል" : "Email",
      type: "email",
      placeholder: "abebe@example.com",
      autoComplete: "email"
    },
    {
      key: "password",
      label: isAmharic ? "የይለፍ ቃል" : "Password",
      type: "password",
      placeholder: isAmharic ? "አዲስ የይለፍ ቃል ይፍጠሩ" : "Create a password",
      autoComplete: "new-password"
    },
    {
      key: "confirmPassword",
      label: isAmharic ? "የይለፍ ቃል ያረጋግጡ" : "Confirm Password",
      type: "password",
      placeholder: isAmharic ? "የይለፍ ቃልዎን በድጋሚ ያስገቡ" : "Repeat your password",
      autoComplete: "new-password"
    },
    {
      key: "referralCode",
      label: isAmharic ? "የግብዣ ኮድ (አማራጭ)" : "Referral Code (optional)",
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4 shadow-lg shadow-black/30">
              <img src={logoNaomi} alt="Naomi Labs logo" className="w-10 h-10 object-contain" />
            </div>
            <h1
              className="text-3xl text-foreground"
              style={displayFont}
            >
              {isAmharic ? "መለያ ይፍጠሩ" : "Create Account"}
            </h1>
            <p
              className="text-muted-foreground mt-1 text-sm"
              style={displayFont}
            >
              {isAmharic ? "ዛሬውኑ ናኦሚ ላብስን ይቀላቀሉ" : "Join Naomi Labs today"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
            {fields.map(field => (
              <div key={field.key}>
                <label
                  htmlFor={`register-${field.key}`}
                  className="block text-[20px] font-semibold text-foreground mb-2"
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
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-black/30 text-sm"
                  style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-3.5 bg-black text-white rounded-2xl font-bold text-sm shadow-lg shadow-black/25 hover:opacity-80 active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
              style={displayFont}
            >
              {registerMutation.isPending
                ? (isAmharic ? "መለያ በመፍጠር ላይ..." : "Creating account...")
                : (isAmharic ? "መለያ ፍጠር" : "Create Account")}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
            {isAmharic ? "አስቀድመው መለያ አለዎት? " : "Already have an account? "}
            <Link href="/login" className="text-black font-semibold" style={displayFont}>
              {isAmharic ? "ግባ" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
