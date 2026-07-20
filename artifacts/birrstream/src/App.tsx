import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Dashboard from "@/pages/dashboard";
import Packages from "@/pages/packages";
import Tasks from "@/pages/tasks";
import Deposit from "@/pages/deposit";
import Withdraw from "@/pages/withdraw";
import WithdrawalSettings from "@/pages/withdrawal-settings";
import Referral from "@/pages/referral";
import AffiliateNetwork from "@/pages/affiliate-network";
import VipUpgrades from "@/pages/vip-upgrades";
import Transactions from "@/pages/transactions";
import Support from "@/pages/support";
import DeleteAccount from "@/pages/delete-account";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 30 * 1000, // treat data as fresh for 30s — prevents refetch storms on HMR reconnects
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Redirect to="/login" />;
  return <Component />;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Redirect to="/dashboard" />;
  return <Component />;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location]);
  return null;
}

function Router() {
  return (
    <AppLayout>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={() => <Redirect to="/dashboard" />} />
        <Route path="/login" component={() => <PublicRoute component={Login} />} />
        <Route path="/register" component={() => <PublicRoute component={Register} />} />
        <Route path="/forgot-password" component={() => <PublicRoute component={ForgotPassword} />} />
        <Route path="/reset-password" component={() => <PublicRoute component={ResetPassword} />} />
        <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
        <Route path="/packages" component={() => <ProtectedRoute component={Packages} />} />
        <Route path="/tasks" component={() => <ProtectedRoute component={Tasks} />} />
        <Route path="/deposit" component={() => <ProtectedRoute component={Deposit} />} />
        <Route path="/withdraw" component={() => <ProtectedRoute component={Withdraw} />} />
        <Route path="/withdrawal-settings" component={() => <ProtectedRoute component={WithdrawalSettings} />} />
        <Route path="/referral" component={() => <ProtectedRoute component={Referral} />} />
        <Route path="/affiliate-network" component={() => <ProtectedRoute component={AffiliateNetwork} />} />
        <Route path="/vip-upgrades" component={() => <ProtectedRoute component={VipUpgrades} />} />
        <Route path="/transactions" component={() => <ProtectedRoute component={Transactions} />} />
        <Route path="/support" component={() => <ProtectedRoute component={Support} />} />
        <Route path="/delete-account" component={() => <ProtectedRoute component={DeleteAccount} />} />
        <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
        <Route path="/admin" component={() => <ProtectedRoute component={Admin} />} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
