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

  React.useEffect(() => {
    // Wallet integration pending → no mock fallback
    setLoading(false);
    setRows([]);
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
            <PortfolioOverviewChart period={period} />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <AccountSummary rows={rows as any} />
          </div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <PositionsList rows={rows as any} />
          <div className="mt-8">
            <RewardsChart className="mt-0" />
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
