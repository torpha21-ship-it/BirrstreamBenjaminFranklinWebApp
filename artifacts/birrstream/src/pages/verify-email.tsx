import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, AlertCircle, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function getTokenFromUrl(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("token") ?? "";
}

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();
  const [token] = useState(getTokenFromUrl);
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token ? "verifying" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    async function verifyToken() {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok) {
          setStatus("success");
          toast({ title: "Email verified successfully!", description: "Your account is now fully verified." });
          if (refetchUser) refetchUser();
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Invalid or expired verification token.");
        }
      } catch (err: any) {
        if (!isMounted) return;
        setStatus("error");
        setErrorMessage("Network error verifying email. Please try again.");
      }
    }

    verifyToken();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async () => {
    setIsSending(true);
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}),
        },
        body: JSON.stringify({ email: user?.email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Verification link sent!", description: data.message || "Please check your inbox." });
      } else {
        toast({ title: "Failed to send link", description: data.error || "Please try again later.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to connect to server.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border text-center">
          {status === "verifying" && (
            <div className="py-8 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
              <h2 className="text-xl font-bold text-foreground">Verifying Email...</h2>
              <p className="text-sm text-muted-foreground">Please wait while we validate your verification token.</p>
            </div>
          )}

          {status === "success" && (
            <div className="py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Email Verified!</h2>
              <p className="text-sm text-muted-foreground">
                Thank you for verifying your email address. Your BirrStream account is now 100% active and trusted.
              </p>
              <Button
                onClick={() => setLocation("/dashboard")}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 mt-4"
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/15 text-destructive flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Verification Failed</h2>
              <p className="text-sm text-destructive font-medium">{errorMessage}</p>
              <p className="text-xs text-muted-foreground">
                The verification link may have expired or already been used.
              </p>
              <Button
                onClick={handleResend}
                disabled={isSending}
                className="w-full py-3 bg-primary text-white font-bold rounded-2xl mt-4"
              >
                {isSending ? "Sending..." : "Resend Verification Email"}
              </Button>
            </div>
          )}

          {status === "idle" && (
            <div className="py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto">
                <Mail className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Verify Your Email</h2>
              <p className="text-sm text-muted-foreground">
                {user?.emailVerified
                  ? "Your email address is already verified!"
                  : `Click below to receive a verification link sent to ${user?.email || "your registered email"}.`}
              </p>

              {user?.emailVerified ? (
                <Button
                  onClick={() => setLocation("/dashboard")}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl mt-4"
                >
                  Return to Dashboard
                </Button>
              ) : (
                <Button
                  onClick={handleResend}
                  disabled={isSending}
                  className="w-full py-3.5 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 mt-4"
                >
                  {isSending ? "Sending Link..." : "Send Verification Link"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
