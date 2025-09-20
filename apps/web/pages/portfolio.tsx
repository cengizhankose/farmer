"use client";
import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
// import { UserPosition } from "../../../../packages/shared/src/types"; // TODO: Use when wallet integration ready
import { Logger } from "@/lib/adapters/real";
import { Card, Button } from "@/components/ui/primitives";
import { toast } from "sonner";
import { colors } from "../lib/colors";
import { AccountSummary } from "@/components/portfolio/AccountSummary";
import { PositionsList } from "@/components/portfolio/PositionsList";
import RewardsChart from "@/components/RewardsChart";
import PortfolioOverviewChart from "@/components/PortfolioOverviewChart";
import { ActivityFeed } from "@/components/portfolio/ActivityFeed";
import { toCSV, downloadCSV } from "@/lib/csv";

// Removed unused calc function - was used for MiniSummary that was removed

// Type for compatibility with existing components
type RedirectEntry = {
  id: string;
  protocol: string;
  pair: string;
  apr: number;
  amount: number;
  days: number;
  ts: number;
  chain: string;
  txid?: string;
  action?: "Deposit" | "Withdraw";
};

export default function PortfolioPage() {
  // const [positions, setPositions] = React.useState<UserPosition[]>([]); // TODO: Use when wallet integration ready
  const [rows, setRows] = React.useState<RedirectEntry[]>([]);
  const [period, setPeriod] = React.useState<"24H" | "7D" | "30D">("30D");
  const [loading, setLoading] = React.useState(true);
  const [error] = React.useState<string | null>(null);

  // Overview chart row type for explicit shape
  type OverviewRow = { t: string; total: number; pnl: number; chg24h: number };
  const [overviewByPeriod, setOverviewByPeriod] = React.useState<Record<"24H" | "7D" | "30D", OverviewRow[]>>({
    "24H": [],
    "7D": [],
    "30D": []
  });
  // Rewards chart data
  type RewardPoint = { date: string; ALEX: number; DIKO: number; OTHER?: number };
  const [rewardsWeekly, setRewardsWeekly] = React.useState<RewardPoint[]>([]);
  const [rewardsMonthly, setRewardsMonthly] = React.useState<RewardPoint[]>([]);
  const [scenario, setScenario] = React.useState<"A" | "B">("A");

  // Deterministic pseudo-random for stable, scenario-specific mock data
  const seeded = (seed: number) => {
    let s = seed;
    return () => {
      s = (s * 1664525 + 1013904223) % 0xffffffff;
      return s / 0xffffffff;
    };
  };

  const genOverview = (points: number, seed: number, baseTotal: number): OverviewRow[] => {
    const rnd = seeded(seed);
    const out: OverviewRow[] = [];
    let total = baseTotal;
    let pnl = 0;
    // Use fixed base date (day precision) to avoid hydration mismatches
    const baseDate = new Date(Math.floor(Date.now() / 86400000) * 86400000);
    for (let i = points - 1; i >= 0; i--) {
      const drift = (rnd() - 0.48) * 0.02; // ~±2%
      const change = total * drift;
      total = Math.max(1500, total + change);
      pnl += change * 0.5;
      const dt = new Date(baseDate.getTime() - i * 24 * 3600 * 1000);
      out.push({
        t: dt.toISOString().slice(0, 10),
        total: Math.round(total),
        pnl: Math.round(pnl),
        chg24h: Math.round(change)
      });
    }
    return out;
  };

  const genRewards = (days: number, seed: number): RewardPoint[] => {
    const rnd = seeded(seed);
    const out: RewardPoint[] = [];
    // Start levels vary per scenario; small random walk per day
    let a = 35 + rnd() * 20; // ALEX
    let d = 15 + rnd() * 10; // DIKO
    let o = 6 + rnd() * 8;   // OTHER
    const baseDate = new Date(Math.floor(Date.now() / 86400000) * 86400000);
    for (let i = days - 1; i >= 0; i--) {
      a = Math.max(0, a + (rnd() - 0.48) * 6);
      d = Math.max(0, d + (rnd() - 0.5) * 3);
      o = Math.max(0, o + (rnd() - 0.52) * 4);
      const dt = new Date(baseDate.getTime() - i * 24 * 3600 * 1000);
      out.push({ date: dt.toISOString().slice(0, 10), ALEX: +a.toFixed(2), DIKO: +d.toFixed(2), OTHER: +o.toFixed(2) });
    }
    return out;
  };

  const buildRowsScenario = (variant: "A" | "B"): RedirectEntry[] => {
    const now = Date.now();
    const base = variant === "A" ? 1 : 2; // simple branch for deterministic diffs
    const mk = (
      id: string,
      protocol: string,
      pair: string,
      apr: number,
      amount: number,
      days: number,
      offsetDays: number,
      action: "Deposit" | "Withdraw" = "Deposit",
      txid?: string
    ): RedirectEntry => ({
      id,
      protocol,
      pair,
      apr,
      amount: Math.round(amount * 100) / 100,
      days,
      ts: now - offsetDays * 24 * 3600 * 1000 + base * 7777, // stable shift between scenarios
      chain: "stacks",
      action,
      txid
    });

    // Compose a realistic activity feed across multiple pools
    const rows: RedirectEntry[] = [
      // ZEST STX
      mk("zest-stx", "ZEST", "STX", variant === "A" ? 13.4 : 16.1, 2400 + 300 * base, 30, 2, "Deposit"),
      mk("zest-stx", "ZEST", "STX", variant === "A" ? 13.4 : 16.1, 900 + 120 * base, 14, 1, "Deposit"),

      // Arkadiko STX/WELSH
      mk("arkadiko-stx-welsh", "Arkadiko", "STX/WELSH", variant === "A" ? 27.5 : 31.2, 1500 + 200 * base, 25, 8, "Deposit"),

      // Arkadiko xBTC/USDA
      mk("arkadiko-xbtc-usda", "Arkadiko", "xBTC/USDA", variant === "A" ? 14.6 : 17.8, 5200 + 600 * base, 45, 10, "Deposit"),
      mk("arkadiko-xbtc-usda", "Arkadiko", "xBTC/USDA", variant === "A" ? 14.6 : 17.8, 1200, 20, 3, "Deposit"),
      mk("arkadiko-xbtc-usda", "Arkadiko", "xBTC/USDA", variant === "A" ? 14.6 : 17.8, 700, 10, 0, "Withdraw"),

      // Arkadiko STX/DIKO
      mk("arkadiko-stx-diko", "Arkadiko", "STX/DIKO", variant === "A" ? 23.9 : 28.7, 1000, 18, 5, "Deposit"),

      // ZEST AEUSDC (stable-ish)
      mk("zest-aeusdc", "ZEST", "AEUSDC", variant === "A" ? 6.8 : 9.1, 2600, 16, 6, "Deposit"),
      mk("zest-aeusdc", "ZEST", "AEUSDC", variant === "A" ? 6.8 : 9.1, 900, 6, 1, "Deposit"),
    ];

    // Sort by time desc for highlighting in ActivityFeed
    return rows.sort((a, b) => b.ts - a.ts);
  };

  React.useEffect(() => {
    // Alternate between two scenarios on every reload
    try {
      const last = localStorage.getItem("portfolio_mock_scenario");
      const next: "A" | "B" = last === "A" ? "B" : "A";
      localStorage.setItem("portfolio_mock_scenario", next);
      setScenario(next);

      // Prepare scenario-specific datasets
      const isA = next === "A";
      const seed = isA ? 1337 : 4242;
      const baseTotal = isA ? 112_000 : 86_500;
      const overview24 = genOverview(24, seed + 1, Math.round(baseTotal * 0.98));
      const overview7 = genOverview(7, seed + 2, baseTotal);
      const overview30 = genOverview(30, seed + 3, Math.round(baseTotal * 0.92));
      setOverviewByPeriod({ "24H": overview24, "7D": overview7, "30D": overview30 });

      setRewardsWeekly(genRewards(7, seed + 10));
      setRewardsMonthly(genRewards(30, seed + 20));

      setRows(buildRowsScenario(next));
      setLoading(false);
    } catch (e) {
      // Fallback: still set something
      Logger.warn("Mock scenario init failed, falling back to A");
      setScenario("A");
      setOverviewByPeriod({ "24H": genOverview(24, 1, 100_000), "7D": genOverview(7, 2, 100_000), "30D": genOverview(30, 3, 95_000) });
      setRewardsWeekly(genRewards(7, 11));
      setRewardsMonthly(genRewards(30, 21));
      setRows(buildRowsScenario("A"));
      setLoading(false);
    }
  }, []);

  // Removed unused variables - MiniSummary was removed per user request

  const clear = () => {
    Logger.info('🧽 Clearing portfolio data...');
    localStorage.removeItem("stacks_portfolio_mock");
    setRows([]);
    toast("Cleared", { description: "Portfolio history cleared." });
  };

  const exportCSV = () => {
    Logger.info('📄 Exporting portfolio to CSV...');
    const withEst = rows.map((r) => ({
      When: new Date(r.ts).toISOString(),
      Protocol: r.protocol,
      Pair: r.pair,
      Amount: r.amount,
      APR: r.apr,
      Days: r.days,
      EstReturn: (r.amount * (r.apr / 100) * (r.days / 365)).toFixed(2),
    }));
    const csv = toCSV(withEst, ["When", "Protocol", "Pair", "Amount", "APR", "Days", "EstReturn"]);
    downloadCSV("portfolio.csv", csv);
    Logger.info(`✅ Exported ${rows.length} portfolio entries to CSV`);
  };

  const emptyIllustration = "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?auto=format&fit=crop&q=80&w=1200";

  return (
    <>
      <Head>
        <title>Portfolio | Farmer</title>
        <meta name="description" content="Track your yield farming portfolio, view positions, and monitor your returns on Farmer." />
        <meta property="og:title" content="Portfolio | Farmer" />
        <meta property="og:description" content="Track your yield farming portfolio, view positions, and monitor your returns on Farmer." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Portfolio | Farmer" />
        <meta name="twitter:description" content="Track your yield farming portfolio, view positions, and monitor your returns on Farmer." />
      </Head>
      <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="typo-portfolio-h1">Portfolio</h1>
      <p className="typo-portfolio-sub max-w-2xl">💼 Real portfolio tracking (wallet integration pending). Recent redirects and estimated returns shown below.
      </p>
      
      {/* Portfolio Status Indicator */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 text-red-600">❌</div>
            <div>
              <p className="text-sm font-medium text-red-800">
                Portfolio Loading Failed
              </p>
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!error && !loading && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center space-x-3">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-blue-800">
                🚀 Portfolio System Ready
              </p>
              <p className="text-sm text-blue-700">
                Wallet integration required to show real transactions
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            Loading portfolio data...
          </div>
        </div>
      ) : rows.length === 0 ? (
        <Card className="mt-8 overflow-hidden border-white/40 bg-white/60 backdrop-blur-2xl">
          <div className="relative h-48 w-full">
            <Image src={emptyIllustration} alt="empty" fill className="object-cover" />
          </div>
          <div className="p-6">
            <h3 className="typo-section-h">Start farming now</h3>
            <p className="typo-empty mt-1">Explore opportunities and use the deposit button to add entries here.</p>
            <Link href="/opportunities" className="typo-link-primary mt-4 inline-block">Browse opportunities →</Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Period Toggle */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex rounded-lg bg-neutral-100 p-1">
              {(["24H", "7D", "30D"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`typo-toggle px-4 py-2 rounded-md transition-colors ${
                    period === p
                      ? "bg-[#FF6A00] text-white shadow-sm"
                      : "text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <PortfolioOverviewChart period={period} data={overviewByPeriod[period]} />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <AccountSummary rows={rows as any} />
          </div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <PositionsList rows={rows as any} />
          <div className="mt-8">
            <RewardsChart className="mt-0" dataWeekly={rewardsWeekly} dataMonthly={rewardsMonthly} />
          </div>
          <Card className="mt-6 border-white/40 bg-white/60 p-4 backdrop-blur-2xl">
            <div className="flex items-center justify-between px-2">
              <h3 className="typo-section-h">Recent activity</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={exportCSV} className={`border-[${colors.zinc[300]}]`}>Export CSV</Button>
                <Button variant="outline" onClick={clear} className={`border-[${colors.zinc[300]}]`}>Clear</Button>
              </div>
            </div>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ActivityFeed rows={rows as any} />
          </Card>
        </>
      )}
    </div>
    </>
  );
}
