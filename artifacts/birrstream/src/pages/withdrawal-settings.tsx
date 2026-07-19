import { useState, useEffect } from "react";
import { useGetWithdrawalSettings, getGetWithdrawalSettingsQueryKey, useUpdateWithdrawalSettings } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

const BANKS = ["Commercial Bank of Ethiopia", "Dashen Bank", "Awash Bank", "Bank of Abyssinia", "Cooperative Bank of Oromia", "Telebirr Wallet", "HelloCash", "M-Pesa Ethiopia"];

export default function WithdrawalSettings() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: settings, isLoading } = useGetWithdrawalSettings({ query: { queryKey: getGetWithdrawalSettingsQueryKey() } });
  const updateMutation = useUpdateWithdrawalSettings();
  const [form, setForm] = useState({ bankName: "", accountName: "", walletId: "" });

  useEffect(() => {
    if (settings?.isConfigured) {
      setForm({
        bankName: settings.bankName ?? "",
        accountName: settings.accountName ?? "",
        walletId: settings.walletId ?? "",
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      { data: form },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetWithdrawalSettingsQueryKey() });
          toast({ title: "Settings saved!", description: "Your withdrawal settings have been updated." });
        },
        onError: () => toast({ title: "Failed to save settings", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/withdraw" className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>Withdrawal Settings</h1>
      </div>

      {settings?.isConfigured && (
        <div className="flex items-center gap-2 bg-[#A8D5B5] rounded-2xl p-4 mb-5">
          <CheckCircle2 className="w-5 h-5 text-[#2B7A4B]" />
          <p className="text-[#2B7A4B] text-sm font-semibold">Bank account configured</p>
        </div>
      )}

      <div className="bg-card rounded-3xl p-5 border border-border">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Bank / Wallet Type</label>
            <select
              value={form.bankName}
              onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))}
              required
              className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            >
              <option value="">Select a bank or wallet</option>
              {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Account Name</label>
            <input
              type="text"
              value={form.accountName}
              onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))}
              placeholder="Full name on account"
              required
              className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Account / Wallet ID</label>
            <input
              type="text"
              value={form.walletId}
              onChange={e => setForm(f => ({ ...f, walletId: e.target.value }))}
              placeholder="Account number or wallet ID"
              required
              className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
          <div className="p-3 bg-[#F5E6A3] rounded-2xl">
            <p className="text-[#8B7200] text-xs">This information is used for all future withdrawal requests. Ensure it's accurate before saving.</p>
          </div>
          <button
            type="submit"
            disabled={updateMutation.isPending || isLoading}
            className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            <span style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>{updateMutation.isPending ? "Saving..." : "Save Settings"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
