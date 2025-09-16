import React from "react";
import { useParams, Link } from "react-router-dom";
import { getOpportunityById, addRecentRedirect } from "../mock.js";
import { Card } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Slider } from "../components/ui/slider.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip.jsx";
import { toast } from "sonner";
import { ArrowUpRight } from "lucide-react";

export default function OpportunityDetail() {
  const { id } = useParams();
  const data = getOpportunityById(id);
  const [amount, setAmount] = React.useState(100);
  const [days, setDays] = React.useState([30]);

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold text-zinc-900">Not found</h2>
        <p className="mt-2 text-zinc-600">We couldn't locate this opportunity.</p>
        <Link to="/opportunities" className="mt-4 inline-block text-emerald-700 hover:underline">Back to list</Link>
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
          <h1 className="font-[Sora] text-2xl text-zinc-900">{data.protocol} — {data.pair}</h1>
          <p className="mt-2 text-zinc-600">{data.summary}</p>

          <Card className="mt-6 border-white/40 bg-white/60 p-6 backdrop-blur-2xl">
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-zinc-500">APR</div>
                <div className="text-zinc-900">{data.apr}%</div>
              </div>
              <div>
                <div className="text-zinc-500">APY</div>
                <div className="text-zinc-900">{data.apy}%</div>
              </div>
              <div>
                <div className="text-zinc-500">TVL</div>
                <div className="text-zinc-900">${(data.tvlUsd/1_000_000).toFixed(2)}M</div>
              </div>
            </div>

            <div className="mt-6 text-sm text-zinc-600">
              APR → APY assumes continuous compounding; reward token: <span className="font-medium text-zinc-900">{data.rewardToken}</span>.
            </div>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="border-white/40 bg-white/60 p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-600">Deposit (Model A)</div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-default border-emerald-300 text-emerald-700">B: one-click soon</Badge>
                  </TooltipTrigger>
                  <TooltipContent>Router (B) testnet integration in progress</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="mt-4 space-y-3">
              <label className="text-sm text-zinc-700">Amount (principal)</label>
              <Input type="number" value={amount} min={0} onChange={(e) => setAmount(Number(e.target.value))} />

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-zinc-700">
                  <span>Days</span>
                  <span className="text-zinc-500">{days[0]}d</span>
                </div>
                <Slider value={days} onValueChange={setDays} min={1} max={365} step={1} className="mt-2" />
              </div>

              <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">Net return (beta)</span>
                  <span className="font-medium text-zinc-900">${est}</span>
                </div>
                <div className="mt-1 text-xs text-zinc-500">Estimate: APR * principal * days / 365</div>
              </div>

              <Button className="mt-4 w-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={handleDepositRedirect}>
                Go to protocol <ArrowUpRight className="ml-2" size={16} />
              </Button>
              <div className="text-xs text-zinc-500">You will be redirected to {data.protocol}. No custody here.</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}