"use client";
import React from "react";
import { useRouter } from "next/router";
import { CHAINS } from "@/lib/chains";
// Temporarily removed risk components due to TypeScript errors
// import { RiskTooltip } from "@/components/risk/RiskTooltip";
// import { RiskScore } from "@shared/core";

// Type definition for component props (supports both real and legacy data)
type Opportunity = {
  id: string;
  protocol: string;
  pair: string;
  chain: string;
  apr: number;
  apy: number;
  risk: "Low" | "Medium" | "High";
  tvlUsd: number;
  rewardToken: string;
  lastUpdated: string;
  originalUrl: string;
  summary: string;
  source?: 'live' | 'demo';
  logoUrl?: string;
};
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
  const [imgOk, setImgOk] = React.useState(Boolean(data.logoUrl));
  const isArkadiko = data.protocol.toLowerCase() === 'arkadiko';

  // Risk components temporarily removed due to TypeScript errors
  // const getMockRiskScore = (): RiskScore => {
  //   const baseScore = data.risk === 'Low' ? 25 : data.risk === 'Medium' ? 50 : 75;
  //   return {
  //     total: baseScore,
  //     overall: baseScore,
  //     label: data.risk.toLowerCase() as 'low' | 'medium' | 'high',
  //     components: {
  //       liquidity: baseScore + Math.random() * 10 - 5,
  //       stability: baseScore + Math.random() * 10 - 5,
  //       yield: baseScore + Math.random() * 10 - 5,
  //       concentration: baseScore + Math.random() * 10 - 5,
  //       momentum: baseScore + Math.random() * 10 - 5,
  //     },
  //     confidence: 'high',
  //     timestamp: Date.now(),
  //     drivers: [
  //       `${data.protocol} protocol stability`,
  //       'Market volatility conditions',
  //       'Liquidity depth analysis',
  //     ]
  //   };
  // };

  // const riskScore = getMockRiskScore();
  const Action = (
    <Button
      className="w-full text-white hover:bg-[var(--brand-orange-700)] transition-colors"
      style={{ backgroundColor: 'var(--brand-orange)' }}
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
      className={`group relative overflow-hidden rounded-3xl border border-black/5 bg-[var(--sand-50)] shadow-sm p-5 md:p-6 transition hover:-translate-y-1 hover:shadow-md ${disabled ? "opacity-60" : ""
        }`}
    >
      {/* Curved corner logo badge */}
      {(() => {
        const l = protocolLogo(data.protocol);
        const size = { w: 42, h: 42 };

        return (
          <div
            className="absolute grid place-items-center"
            style={{
              top: '-3px',
              left: '-3px',
              width: `${size.w}px`,
              height: `${size.h}px`,
              background: 'var(--badge-lilac)',
              borderRadius: '18px 0px 18px 0px',
              boxShadow: '0 4px 10px rgba(0,0,0,.06)',
              overflow: 'hidden'
            }}
            title={data.protocol}
            aria-hidden
          >
            {isArkadiko ? (
              // Always show local Arkadiko logo (no letter fallback)
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/logos/arkadiko.svg"
                alt="Arkadiko logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block',
                  borderRadius: 'inherit'
                }}
              />
            ) : imgOk && data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.logoUrl}
                alt={data.protocol}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block',
                  borderRadius: 'inherit'
                }}
                onError={() => setImgOk(false)}
              />
            ) : (
              <span className="text-sm md:text-base font-semibold" style={{ color: l.fg }}>
                {l.letter}
              </span>
            )}
          </div>
        );
      })()}

      <div className="flex items-start justify-between">
        <div className="ml-6">
          <div className="text-sm font-semibold text-zinc-600">
            {data.protocol}
          </div>
          <div className="mt-1 text-base md:text-lg font-bold text-zinc-900">
            {data.pair}
          </div>
        </div>
        {/* RiskTooltip temporarily removed due to TypeScript errors */}
        <Badge className={`${riskColors[data.risk]} border-0 text-xs font-medium`}>
          {data.risk}
        </Badge>
      </div>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <div className="text-[11px] uppercase font-medium text-zinc-500 tracking-wide">APR</div>
          <div className="text-sm md:text-base font-semibold leading-tight text-zinc-900 tabular-nums">
            {formatPct(data.apr, 2)}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase font-medium text-zinc-500 tracking-wide">APY</div>
          <div className="text-sm md:text-base font-semibold leading-tight text-zinc-900 tabular-nums">
            {formatPct(data.apy, 2)}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase font-medium text-zinc-500 tracking-wide">TVL</div>
          <div className="text-sm md:text-base font-semibold leading-tight text-zinc-900 tabular-nums">
            {formatTVL(data.tvlUsd)}
          </div>
        </div>
      </div>

      {/* Footer info removed per request */}

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
