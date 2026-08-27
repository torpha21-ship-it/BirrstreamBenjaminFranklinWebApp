import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useResetPassword } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/language-context";

function getTokenFromUrl(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("token") ?? "";
}

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAmharic } = useLanguage();
  const [token] = useState(getTokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mutation = useResetPassword();

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Plus Jakarta Sans', sans-serif",
    letterSpacing: isAmharic ? "0" : "-0.01em",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(isAmharic ? "የመቀየሪያ ምልክት የለም። እባክዎ ከኢሜይልዎ ያለውን ሊንክ ይጠቀሙ።" : "Missing reset token. Please use the link from your email.");
      return;
    }
    if (newPassword.length < 8) {
      setError(isAmharic ? "የይለፍ ቃል ቢያንስ 8 ቁምፊዎች መሆን አለበት።" : "Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(isAmharic ? "የይለፍ ቃሎች አይዛመዱም።" : "Passwords do not match.");
      return;
    }

    mutation.mutate(
      { data: { token, newPassword } },
      {
        onSuccess: () => {
          toast({ title: isAmharic ? "የይለፍ ቃል ተዘምኗል። አሁን መግባት ይችላሉ።" : "Password updated. You can now log in." });
          setLocation("/login");
        },
        onError: (err: any) => {
          const message =
            err?.data?.error ??
            (isAmharic ? "ልክ ያልሆነ ወይም ጊዜው ያለፈበት ሊንክ ነው። እባክዎ አዲስ ይጠይቁ።" : "Invalid or expired reset link. Please request a new one.");
          setError(message);
        },
      },
    );
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8 hover:text-foreground transition-colors"
          style={displayFont}
        >
          <ArrowLeft className="w-4 h-4" /> {isAmharic ? "ወደ መግቢያ ተመለስ" : "Back to login"}
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground" style={displayFont}>
            {isAmharic ? "አዲስ የይለፍ ቃል አዘጋጅ" : "Set New Password"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
            {isAmharic ? "ለመለያዎ አዲስ የይለፍ ቃል ይምረጡ" : "Choose a new password for your account"}
          </p>
        </div>
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
          {!token ? (
            <div className="text-center py-4">
              <p className="font-semibold text-foreground" style={displayFont}>
                {isAmharic ? "ልክ ያልሆነ የይለፍ ቃል መቀየሪያ ሊንክ" : "Invalid reset link"}
              </p>
              <p className="text-sm text-muted-foreground mt-2" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                {isAmharic ? "ይህ ሊንክ ተገቢውን ማስረጃ አልያዘም። እባክዎ አዲስ ሊንክ ይጠይቁ።" : "This link is missing its token. Please request a new reset link."}
              </p>
              <Link
                href="/forgot-password"
                className="inline-block mt-4 text-sm text-primary font-semibold"
                style={displayFont}
              >
                {isAmharic ? "አዲስ ሊንክ ይጠይቁ" : "Request a new link"}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2" style={displayFont}>
                  {isAmharic ? "አዲስ የይለፍ ቃል" : "New password"}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isAmharic ? "ቢያንስ 8 ቁምፊዎች" : "At least 8 characters"}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2" style={displayFont}>
                  {isAmharic ? "የይለፍ ቃል ያረጋግጡ" : "Confirm password"}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isAmharic ? "የይለፍ ቃልዎን በድጋሚ ያስገቡ" : "Re-enter your new password"}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
                style={displayFont}
              >
                {mutation.isPending
                  ? (isAmharic ? "በማዘመን ላይ..." : "Updating...")
                  : (isAmharic ? "የይለፍ ቃል አዘምን" : "Update Password")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
