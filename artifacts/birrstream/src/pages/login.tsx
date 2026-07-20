import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import bsLogo from "@/assets/BS-logo.svg";
import jesterImg from "@/assets/jester.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ usernameOrEmail: "", password: "", rememberMe: false });
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { data: { usernameOrEmail: form.usernameOrEmail, password: form.password, rememberMe: form.rememberMe } },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          setLocation("/dashboard");
        },
        onError: () => {
          toast({ title: "Login failed", description: "Invalid credentials. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background overflow-hidden relative">
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo + heading */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4 shadow-lg shadow-black/30">
              <img src={bsLogo} alt="BirrStream logo" className="w-10 h-10 object-contain" style={{ filter: "invert(1)" }} />
            </div>
            <h1
              className="text-3xl text-foreground"
              style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.08em" }}
            >
              BirrStream
            </h1>
            <p
              className="text-muted-foreground mt-1 text-sm"
              style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}
            >
              Welcome back
            </p>
          </div>

          {/* Form — no card wrapper */}
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
            <div>
              <label
                htmlFor="login-username-or-email"
                className="block text-[20px] font-semibold text-foreground mb-2"
                style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}
              >
                Username or Email
              </label>
              <input
                id="login-username-or-email"
                name="usernameOrEmail"
                type="text"
                value={form.usernameOrEmail}
                onChange={e => setForm(f => ({ ...f, usernameOrEmail: e.target.value }))}
                placeholder="Enter your username or email"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-black/30 text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="block text-[20px] font-semibold text-foreground mb-2"
                style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}
              >
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-black/30 text-sm"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="login-remember-me" className="flex items-center gap-2 cursor-pointer">
                <input
                  id="login-remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={e => setForm(f => ({ ...f, rememberMe: e.target.checked }))}
                  className="w-4 h-4 accent-black rounded"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-black font-semibold">Forgot password?</Link>
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3.5 bg-black text-white rounded-2xl font-bold text-sm shadow-lg shadow-black/25 hover:opacity-80 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-black font-semibold">Create one</Link>
          </p>
        </div>
      </div>

      {/* Jester background image — pinned to bottom, full width */}
      <div className="w-full flex-shrink-0">
        <img
          src={jesterImg}
          alt=""
          aria-hidden="true"
          className="w-full block"
          style={{ display: "block" }}
        />
      </div>
    </div>
  );
}
