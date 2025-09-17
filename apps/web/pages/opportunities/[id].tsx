"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getOpportunityById, addRecentRedirect } from "@/lib/mock";
import { Card, Input, Slider, Badge, Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/primitives";
import { toast } from "sonner";
import { ArrowUpRight } from "lucide-react";
import { colors } from "../../lib/colors";

export default function OpportunityDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const data = getOpportunityById(id);
  const [amount, setAmount] = React.useState(100);
  const [days, setDays] = React.useState([30]);

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className={`text-2xl font-semibold text-[${colors.zinc[900]}]`}>Not found</h2>
        <p className={`mt-2 text-[${colors.zinc[600]}]`}>We couldn't locate this opportunity.</p>
        <Link href="/opportunities" className={`mt-4 inline-block text-[${colors.emerald[700]}] hover:underline`}>Back to list</Link>
      </div>
    );
  }

  const est = (amount * (data.apr/100) * (days[0]/365)).toFixed(2);

  const handleDepositRedirect = () => {
    window.open(data.originalUrl, "_blank");
    addRecentRedirect({
      id: data.id,
      protocol: data.protocol,
      pair: data.pair,
      apr: data.apr,
      amount,
      days: days[0],
      ts: Date.now(),
      chain: data.chain
    });
    toast("Redirected to protocol", { description: `${data.protocol} opened in a new tab. Added to your portfolio history.` });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h1 className={`font-[Sora] text-2xl text-[${colors.zinc[900]}]`}>{data.protocol} — {data.pair}</h1>
          <p className={`mt-2 text-[${colors.zinc[600]}]`}>{data.summary}</p>

          <Card className="mt-6 border-white/40 bg-white/60 p-6 backdrop-blur-2xl">
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <div className={`text-[${colors.zinc[500]}]`}>APR</div>
                <div className={`text-[${colors.zinc[900]}]`}>{data.apr}%</div>
              </div>
              <div>
                <div className={`text-[${colors.zinc[500]}]`}>APY</div>
                <div className={`text-[${colors.zinc[900]}]`}>{data.apy}%</div>
              </div>
              <div>
                <div className={`text-[${colors.zinc[500]}]`}>TVL</div>
                <div className={`text-[${colors.zinc[900]}]`}>${(data.tvlUsd/1_000_000).toFixed(2)}M</div>
              </div>
            </div>

            <div className={`mt-6 text-sm text-[${colors.zinc[600]}]`}>
              APR → APY assumes continuous compounding; reward token: <span className={`font-medium text-[${colors.zinc[900]}]`}>{data.rewardToken}</span>.
            </div>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="border-white/40 bg-white/60 p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <div className={`text-sm text-[${colors.zinc[600]}]`}>Deposit (Model A)</div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className={`cursor-default border-[${colors.emerald[300]}] text-[${colors.emerald[700]}]`}>B: one-click soon</Badge>
                  </TooltipTrigger>
                  <TooltipContent>Router (B) testnet integration in progress</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="mt-4 space-y-3">
              <label className={`text-sm text-[${colors.zinc[700]}]`}>Amount (principal)</label>
              <Input type="number" value={amount} min={0} onChange={(e) => setAmount(Number(e.target.value))} />

              <div className="mt-4">
                <div className={`flex items-center justify-between text-sm text-[${colors.zinc[700]}]`}>
                  <span>Days</span>
                  <span className={`text-[${colors.zinc[500]}]`}>{days[0]}d</span>
                </div>
                <Slider value={days} onValueChange={setDays} min={1} max={365} step={1} className="mt-2" />
              </div>

              <div className={`mt-4 rounded-md border border-[${colors.zinc[200]}] bg-[${colors.zinc[50]}] p-3 text-sm`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[${colors.zinc[600]}]`}>Net return (beta)</span>
                  <span className={`font-medium text-[${colors.zinc[900]}]`}>${est}</span>
                </div>
                <div className={`mt-1 text-xs text-[${colors.zinc[500]}]`}>Estimate: APR * principal * days / 365</div>
              </div>

              <Button className={`mt-4 w-full bg-[${colors.emerald[600]}] text-[${colors.white.DEFAULT}] hover:bg-[${colors.emerald[700]}]`} onClick={handleDepositRedirect}>
                Go to protocol <ArrowUpRight className="ml-2" size={16} />
              </Button>
              <div className={`text-xs text-[${colors.zinc[500]}]`}>You will be redirected to {data.protocol}. No custody here.</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

