import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import bsLogo from "@/assets/BS-logo.svg";

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    fullName: "", username: "", email: "", password: "", confirmPassword: "", referralCode: ""
  });
  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
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
          toast({ title: "Registration failed", description: "Username or email may already be in use.", variant: "destructive" });
        },
      }
    );
  };

  const fields = [
    { key: "fullName", label: "Full Name", type: "text", placeholder: "John Doe", autoComplete: "name" },
    { key: "username", label: "Username", type: "text", placeholder: "johndoe", autoComplete: "username" },
    { key: "email", label: "Email", type: "email", placeholder: "john@example.com", autoComplete: "email" },
    { key: "password", label: "Password", type: "password", placeholder: "Create a password", autoComplete: "new-password" },
    { key: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Repeat your password", autoComplete: "new-password" },
    { key: "referralCode", label: "Referral Code (optional)", type: "text", placeholder: "Enter referral code", autoComplete: "off" },
  ] as const;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background overflow-hidden relative">
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Logo + heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4 shadow-lg shadow-black/30">
              <img src={bsLogo} alt="BirrStream logo" className="w-10 h-10 object-contain" style={{ filter: "invert(1)" }} />
            </div>
            <h1
              className="text-3xl text-foreground"
              style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.08em" }}
            >
              Create Account
            </h1>
            <p
              className="text-muted-foreground mt-1 text-sm"
              style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}
            >
              Join BirrStream today
            </p>
          </div>

          {/* Form — no card wrapper */}
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
            {fields.map(field => (
              <div key={field.key}>
                <label
                  htmlFor={`register-${field.key}`}
                  className="block text-[20px] font-semibold text-foreground mb-2"
                  style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}
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
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-3.5 bg-black text-white rounded-2xl font-bold text-sm shadow-lg shadow-black/25 hover:opacity-80 active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
            >
              {registerMutation.isPending ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-black font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
