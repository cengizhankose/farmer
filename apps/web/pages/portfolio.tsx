"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getRecentRedirects, type RedirectEntry } from "@/lib/mock";
import { Card, Button } from "@/components/ui/primitives";
import { toast } from "sonner";
import { colors } from "../lib/colors";
import { AccountSummary } from "@/components/portfolio/AccountSummary";
import { PositionsList } from "@/components/portfolio/PositionsList";
import RewardsChart from "@/components/RewardsChart";
import PortfolioOverviewChart from "@/components/PortfolioOverviewChart";
import { ActivityFeed } from "@/components/portfolio/ActivityFeed";
import { toCSV, downloadCSV } from "@/lib/csv";

function calc(rows: RedirectEntry[]) {
  const deposited = rows.reduce((a, r) => a + r.amount, 0);
  const est = rows.reduce((a, r) => a + r.amount * (r.apr / 100) * (r.days / 365), 0);
  const total = deposited + est;
  const pnl = total - deposited;
  // Mock 24h change for demo
  const chg24h = total * (Math.random() - 0.5) * 0.02;
  return { total, pnl, chg24h };
}

export default function PortfolioPage() {
  const [rows, setRows] = React.useState<RedirectEntry[]>([]);
  const [period, setPeriod] = React.useState<"24H" | "7D" | "30D">("30D");

  React.useEffect(() => {
    setRows(getRecentRedirects());
  }, []);

  const { total, pnl, chg24h } = React.useMemo(() => calc(rows), [rows]);

  const clear = () => {
    localStorage.removeItem("stacks_portfolio_mock");
    setRows([]);
    toast("Cleared", { description: "Portfolio history cleared." });
  };

  const exportCSV = () => {
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
  };

  const emptyIllustration = "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?auto=format&fit=crop&q=80&w=1200";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold text-neutral-900 tracking-tight">Portfolio</h1>
      <p className="mt-3 max-w-2xl text-lg text-neutral-600">Recent redirects and estimated returns. Testnet canary transactions will appear here later.</p>

      {rows.length === 0 ? (
        <Card className="mt-8 overflow-hidden border-white/40 bg-white/60 backdrop-blur-2xl">
          <div className="relative h-48 w-full">
            <Image src={emptyIllustration} alt="empty" fill className="object-cover" />
          </div>
          <div className="p-6">
            <h3 className={`text-lg font-medium text-[${colors.zinc[900]}]`}>Start farming now</h3>
            <p className={`mt-1 text-sm text-[${colors.zinc[600]}]`}>Explore opportunities and use the deposit button to add entries here.</p>
            <Link href="/opportunities" className={`mt-4 inline-block text-[${colors.emerald[700]}] hover:underline`}>Browse opportunities</Link>
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
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
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
            <AccountSummary rows={rows} />
          </div>
          <PositionsList rows={rows} />
          <div className="mt-8">
            <RewardsChart className="mt-0" />
          </div>
          <Card className="mt-6 border-white/40 bg-white/60 p-4 backdrop-blur-2xl">
            <div className="flex items-center justify-between px-2">
              <h3 className={`text-lg font-medium text-[${colors.zinc[900]}]`}>Recent activity</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={exportCSV} className={`border-[${colors.zinc[300]}]`}>Export CSV</Button>
                <Button variant="outline" onClick={clear} className={`border-[${colors.zinc[300]}]`}>Clear</Button>
              </div>
            </div>
            <ActivityFeed rows={rows} />
          </Card>
        </>
      )}
    </div>
  );
}
