"use client";
import React from "react";
import { useRouter } from "next/router";
import { Opportunity, CHAINS } from "@/lib/mock";
import {
  Card,
  Badge,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/primitives";
import { formatPct, formatTVL } from "@/lib/format";
import { protocolLogo } from "@/lib/logos";

export const OpportunityCard: React.FC<
  { data: Opportunity } & { disabled?: boolean } & { onClick?: () => void }
> = ({ data, disabled, onClick }) => {
  const router = useRouter();
  const chainLabel =
    CHAINS.find((c) => c.id === data.chain)?.label || data.chain;
  const Action = (
    <Button
      className="w-full text-neutral-700 hover:bg-neutral-200 transition-colors"
      style={{ backgroundColor: 'var(--sand-50)' }}
      onClick={() =>
        onClick ? onClick() : router.push(`/opportunities/${data.id}`)
      }
      aria-label={`View details for ${data.protocol} ${data.pair}`}
    >
      View details
    </Button>
  );

  const riskColors = {
    Low: "bg-emerald-100 text-emerald-800",
    Medium: "bg-amber-100 text-amber-900", 
    High: "bg-rose-100 text-rose-800",
  };

  return (
    <Card
      className={`group relative overflow-hidden rounded-3xl border border-black/5 bg-[var(--sand-50)] shadow-sm p-5 md:p-6 transition hover:-translate-y-1 hover:shadow-md ${
        disabled ? "opacity-60" : ""
      }`}
    >
      {/* Curved corner logo badge */}
      {(() => {
        const l = protocolLogo(data.protocol);
        return (
          <div
            className="absolute -top-3 -left-3 h-12 w-12 md:h-14 md:w-14 grid place-items-center"
            style={{ 
              background: 'var(--badge-lilac)', 
              borderRadius: '16px',
              boxShadow: '0 4px 10px rgba(0,0,0,.06)',
            }}
            title={data.protocol}
            aria-hidden
          >
            <span className="text-sm md:text-base font-semibold" style={{ color: l.fg }}>
              {l.letter}
            </span>
          </div>
        );
      })()}

      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-600">
            {data.protocol}
          </div>
          <div className="mt-1 text-base md:text-lg font-bold text-zinc-900">
            {data.pair}
          </div>
        </div>
        <Badge className={`${riskColors[data.risk]} border-0 text-xs font-medium`}>
          {data.risk}
        </Badge>
      </div>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <div className="text-[11px] uppercase font-medium text-zinc-500 tracking-wide">APR</div>
          <div className="text-sm md:text-base font-semibold leading-tight text-zinc-900 tabular-nums">
            {formatPct(data.apr, 1)}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase font-medium text-zinc-500 tracking-wide">APY</div>
          <div className="text-sm md:text-base font-semibold leading-tight text-zinc-900 tabular-nums">
            {formatPct(data.apy, 1)}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase font-medium text-zinc-500 tracking-wide">TVL</div>
          <div className="text-sm md:text-base font-semibold leading-tight text-zinc-900 tabular-nums">
            {formatTVL(data.tvlUsd)}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-600">
        <div className="flex items-center gap-1">
          <span>Last updated {data.lastUpdated}</span>
          <span className="text-zinc-400">·</span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700">
            source: demo
          </span>
        </div>
        <div className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700">
          {chainLabel}
        </div>
      </div>

      <div className="mt-5">
        {disabled ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span>
                  <Button disabled variant="secondary" className="w-full">
                    View details
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Coming soon on {chainLabel}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          Action
        )}
      </div>
    </Card>
  );
};
