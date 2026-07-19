import { useState } from "react";
import { Link } from "wouter";
import { useForgotPassword } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const mutation = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(
      { data: { email } },
      {
        onSuccess: () => setSent(true),
        onError: () => toast({ title: "Something went wrong. Try again.", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
          <p className="text-muted-foreground mt-2 text-sm">Enter your email and we'll send a reset link</p>
        </div>
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <p className="font-semibold text-foreground">Check your inbox!</p>
              <p className="text-sm text-muted-foreground mt-2">If that email is registered, a reset link has been sent.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {mutation.isPending ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
