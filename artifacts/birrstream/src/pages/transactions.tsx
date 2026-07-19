import { useState, useEffect, useMemo, useRef } from "react";
import { useListTransactions, getListTransactionsQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Star, Users, Flame, TrendingUp, Bell, X, Download } from "lucide-react";
import { Link } from "wouter";
import { NEW_EVENTS_KEY, type NewTxEvent } from "@/hooks/use-deposit-watcher";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, LabelList,
} from "recharts";

type FilterType = "all" | "deposits" | "withdrawals" | "task_earnings" | "commissions" | "recent";

const TX_CONFIG: Record<string, { icon: React.ComponentType<any>; bg: string; color: string; sign: string }> = {
  deposit:      { icon: ArrowDownLeft, bg: "bg-[#A8D5B5]", color: "text-[#2B7A4B]", sign: "+" },
  withdrawal:   { icon: ArrowUpRight,  bg: "bg-[#F2A89A]", color: "text-[#C0402E]", sign: "-" },
  task_earning: { icon: Star,          bg: "bg-[#F5E6A3]", color: "text-[#8B7200]", sign: "+" },
  commission:   { icon: Users,         bg: "bg-[#C9BDF5]", color: "text-[#5B44BE]", sign: "+" },
  streak_bonus: { icon: Flame,         bg: "bg-primary/10", color: "text-primary", sign: "+" },
  daily_yield:  { icon: TrendingUp,    bg: "bg-[#A8D5B5]", color: "text-[#2B7A4B]", sign: "+" },
};

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Compact label for bar tops: "1.2k" for large numbers, exact for small. */
function abbrev(v: number): string {
  if (!v) return "";
  if (v >= 10000) return `${Math.round(v / 1000)}k`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(Math.round(v));
}

/** Rounded-top bar shape used by both credit and debit series. */
function MonthBar(props: any) {
  const { x, y, width, height, fill } = props;
  if (!height || height <= 0) return null;
  const r = Math.min(6, width / 2);
  const path = `M${x + r},${y} h${width - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${height - r} h-${width} v-${height - r} a${r},${r} 0 0 1 ${r},-${r}z`;
  return <path d={path} fill={fill} />;
}

function isNewEvent(tx: { type: string; amount: number }, events: NewTxEvent[]) {
  return events.some(e =>
    e.txType === tx.type && Math.abs(e.amount - tx.amount) < 0.01
  );
}

function exportCSV(rows: Array<{ type: string; description: string; amount: number; status: string; createdAt: string }>, label: string) {
  const sign = (type: string) => TX_CONFIG[type]?.sign ?? "+";
  const header = ["Date", "Type", "Description", "Amount (ETB)", "Status"];
  const lines = rows.map(tx => [
    new Date(tx.createdAt).toLocaleDateString("en-ET"),
    tx.type.replace("_", " "),
    `"${tx.description.replace(/"/g, '""')}"`,
    `${sign(tx.type)}${fmt(tx.amount)}`,
    tx.status,
  ].join(","));
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `birrstream-transactions-${label}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Transactions() {
  const [newEvents, setNewEvents] = useState<NewTxEvent[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    try {
      const stored: NewTxEvent[] = JSON.parse(localStorage.getItem(NEW_EVENTS_KEY) ?? "[]");
      if (stored.length > 0) {
        setNewEvents(stored);
        setShowBanner(true);
        localStorage.removeItem(NEW_EVENTS_KEY);
      }
    } catch {}
  }, []);

  const apiFilter = (filter === "all" || filter === "recent") ? undefined : filter;

  // Monthly chart data — always from the unfiltered set so trends are always visible
  const { data: allTransactions } = useListTransactions(
    {},
    { query: { queryKey: getListTransactionsQueryKey({}) } }
  );

  const monthlyData = useMemo(() => {
    if (!allTransactions?.length) return [];
    const map: Record<string, { month: string; credited: number; debited: number; count: number }> = {};
    allTransactions.forEach(tx => {
      const d = new Date(tx.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-ET", { month: "short", year: "2-digit" });
      if (!map[key]) map[key] = { month: label, credited: 0, debited: 0, count: 0 };
      const cfg = TX_CONFIG[tx.type] ?? TX_CONFIG.deposit;
      if (cfg.sign === "+") map[key].credited += tx.amount;
      else map[key].debited += tx.amount;
      map[key].count += 1;
    });
    return Object.keys(map).sort().map(k => map[k]);
  }, [allTransactions]);

  const chartScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chartScrollRef.current && monthlyData.length > 0) {
      chartScrollRef.current.scrollLeft = chartScrollRef.current.scrollWidth;
    }
  }, [monthlyData.length]);

  const { data: transactions, isLoading } = useListTransactions(
    { type: apiFilter },
    { query: { queryKey: getListTransactionsQueryKey({ type: apiFilter }) } }
  );

  const displayed = filter === "recent"
    ? (transactions ?? []).filter(tx => isNewEvent(tx, newEvents))
    : (transactions ?? []);

  const hasRecent = newEvents.length > 0;

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    ...(hasRecent ? [{ key: "recent" as FilterType, label: `Recent` }] : []),
    { key: "deposits", label: "Deposits" },
    { key: "withdrawals", label: "Withdrawals" },
    { key: "task_earnings", label: "Tasks" },
    { key: "commissions", label: "Commissions" },
  ];

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 bg-card rounded-full flex items-center justify-center border border-border">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold text-foreground flex-1">Transactions</h1>
        {displayed.length > 0 && (
          <button
            onClick={() => exportCSV(displayed, filter)}
            className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-2xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        )}
      </div>

      {/* Recent-changes banner */}
      {showBanner && (
        <div className="flex items-center gap-3 mb-4 bg-[#1A1A1A] rounded-2xl px-4 py-3 border border-primary/20">
          <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold">
              {newEvents.length} status update{newEvents.length > 1 ? "s" : ""} since your last visit
            </p>
            <button
              onClick={() => setFilter("recent")}
              className="text-primary text-xs font-medium hover:underline"
            >
              Show recent changes →
            </button>
          </div>
          <button onClick={() => setShowBanner(false)} className="text-gray-500 hover:text-gray-300 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
              filter === f.key
                ? "bg-primary text-white shadow-sm shadow-primary/30"
                : f.key === "recent"
                ? "bg-primary/10 border border-primary/30 text-primary"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.key === "recent" && <Bell className="w-3 h-3" />}
            {f.label}
            {f.key === "recent" && filter !== "recent" && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Monthly breakdown chart */}
      {monthlyData.length > 0 && (() => {
        const currentMonth = monthlyData[monthlyData.length - 1]?.month;
        const chartW = Math.max(monthlyData.length * 80, 280);

        /** Credited bar — hatched history, solid green for current month */
        const CreditBar = (props: any) => {
          const isCurrent = props.payload?.month === currentMonth;
          return <MonthBar {...props} fill={isCurrent ? "#2B7A4B" : "url(#hatch-green)"} />;
        };
        /** Debited bar — hatched history, solid red for current month */
        const DebitBar = (props: any) => {
          const isCurrent = props.payload?.month === currentMonth;
          return <MonthBar {...props} fill={isCurrent ? "#C0402E" : "url(#hatch-red)"} />;
        };

        return (
          <div className="border border-border rounded-2xl p-4 mb-5 overflow-hidden" style={{ background: "#EEF4FF" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-[#2A4A7A] uppercase tracking-wide">Monthly Overview</p>
                <p className="text-[10px] text-[#4A6A9A] mt-0.5">Current month highlighted</p>
              </div>
              <div className="flex gap-3">
                <span className="flex items-center gap-1.5 text-[11px] text-[#2B7A4B] font-semibold">
                  <span className="w-3 h-3 rounded-sm bg-[#2B7A4B] inline-block" />In
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-[#C0402E] font-semibold">
                  <span className="w-3 h-3 rounded-sm bg-[#C0402E] inline-block" />Out
                </span>
              </div>
            </div>

            <div ref={chartScrollRef} className="overflow-x-auto -mx-1 px-1 no-scrollbar">
              <div style={{ width: chartW, height: 210 }}>
                <ComposedChart
                  width={chartW}
                  height={210}
                  data={monthlyData}
                  barCategoryGap="28%"
                  barGap={3}
                  margin={{ top: 24, right: 8, left: 0, bottom: 0 }}
                >
                  {/* Subtle horizontal grid lines for scale reference */}
                  <CartesianGrid
                    yAxisId="amt"
                    strokeDasharray="3 3"
                    stroke="#C8D8F0"
                    horizontal={true}
                    vertical={false}
                  />

                  {/* Left Y-axis: abbreviated ETB amounts */}
                  <YAxis
                    yAxisId="amt"
                    tickFormatter={abbrev}
                    tickCount={4}
                    tick={{ fontSize: 9, fill: "#4A6A9A" }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />

                  <XAxis
                    dataKey="month"
                    tick={({ x, y, payload }: any) => {
                      const isCurrent = payload.value === currentMonth;
                      return (
                        <text
                          x={x} y={y + 12}
                          textAnchor="middle"
                          fontSize={isCurrent ? 11 : 9}
                          fontWeight={isCurrent ? 700 : 400}
                          fill={isCurrent ? "#1A2E4A" : "#6A8AB8"}
                        >
                          {payload.value}
                        </text>
                      );
                    }}
                    axisLine={{ stroke: "#C8D8F0" }}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 12 }}
                    labelStyle={{ color: "#fff", fontWeight: 700, marginBottom: 6 }}
                    cursor={{ fill: "rgba(74,106,154,0.08)" }}
                    formatter={(value: number, name: string) =>
                      [`${value.toLocaleString("en-ET", { minimumFractionDigits: 2 })} ETB`,
                       name === "credited" ? "Money In" : "Money Out"]
                    }
                  />

                  {/* Credited bars — solid green for current, lighter for history */}
                  <Bar yAxisId="amt" dataKey="credited" shape={<CreditBar />}>
                    <LabelList
                      dataKey="credited"
                      position="top"
                      formatter={abbrev}
                      style={{ fontSize: 9, fill: "#1A5A2A", fontWeight: 700 }}
                    />
                  </Bar>

                  {/* Debited bars — solid red for current, lighter for history */}
                  <Bar yAxisId="amt" dataKey="debited" shape={<DebitBar />}>
                    <LabelList
                      dataKey="debited"
                      position="top"
                      formatter={abbrev}
                      style={{ fontSize: 9, fill: "#6A0A0A", fontWeight: 700 }}
                    />
                  </Bar>
                </ComposedChart>
              </div>
            </div>

            {monthlyData.length > 3 && (
              <p className="text-[10px] text-[#4A6A9A] text-center mt-1 opacity-70">← swipe to view earlier months</p>
            )}
          </div>
        );
      })()}

      {/* Summary stats bar */}
      {!isLoading && displayed.length > 0 && (() => {
        let credited = 0, debited = 0;
        displayed.forEach(tx => {
          const cfg = TX_CONFIG[tx.type] ?? TX_CONFIG.deposit;
          if (cfg.sign === "+") credited += tx.amount;
          else debited += tx.amount;
        });
        const net = credited - debited;
        return (
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="bg-card border border-border rounded-2xl px-3 py-3 text-center">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Credited</p>
              <p className="text-sm font-bold text-[#2B7A4B]">+{fmt(credited)}</p>
              <p className="text-[10px] text-muted-foreground">ETB</p>
            </div>
            <div className="bg-card border border-border rounded-2xl px-3 py-3 text-center">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Debited</p>
              <p className="text-sm font-bold text-[#C0402E]">-{fmt(debited)}</p>
              <p className="text-[10px] text-muted-foreground">ETB</p>
            </div>
            <div className="bg-card border border-border rounded-2xl px-3 py-3 text-center">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Net</p>
              <p className={`text-sm font-bold ${net >= 0 ? "text-[#2B7A4B]" : "text-[#C0402E]"}`}>
                {net >= 0 ? "+" : ""}{fmt(net)}
              </p>
              <p className="text-[10px] text-muted-foreground">ETB</p>
            </div>
          </div>
        );
      })()}

      <div className="space-y-3">
        {isLoading ? Array(5).fill(0).map((_, i) => (
          <div key={i} className="h-16 bg-card rounded-2xl animate-pulse border border-border" />
        )) : displayed.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-semibold text-foreground">
              {filter === "recent" ? "No recent changes found" : "No transactions yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === "recent" ? "Recent status updates will appear here" : "Complete tasks or make a deposit to get started"}
            </p>
          </div>
        ) : displayed.map(tx => {
          const cfg = TX_CONFIG[tx.type] ?? TX_CONFIG.deposit;
          const Icon = cfg.icon;
          const isPositive = cfg.sign === "+";
          const isNew = isNewEvent(tx, newEvents);
          return (
            <div
              key={tx.id}
              className={`bg-card rounded-2xl p-4 border flex items-center gap-3 transition-all ${
                isNew
                  ? "border-primary/50 ring-1 ring-primary/20 shadow-sm shadow-primary/10"
                  : "border-border"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                <Icon className={`w-5 h-5 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground truncate">{tx.description}</p>
                  {isNew && (
                    <span className="flex-shrink-0 text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full leading-none">
                      NEW
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`font-bold text-sm ${isPositive ? "text-[#2B7A4B]" : "text-[#C0402E]"}`}>
                  {cfg.sign}{fmt(tx.amount)} ETB
                </p>
                <p className={`text-xs capitalize ${tx.status === "pending" ? "text-[#D4B61B]" : tx.status === "rejected" ? "text-[#C0402E]" : "text-muted-foreground"}`}>
                  {tx.status}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
