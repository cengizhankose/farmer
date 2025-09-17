"use client";
import React from "react";
import { useRouter } from "next/router";
import { Opportunity, CHAINS, RISK_COLORS } from "@/lib/mock";
import {
  Card,
  Badge,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/primitives";
import { colors } from "@/lib/colors";
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
      className={`w-full bg-[${colors.emerald[600]}] text-[${colors.white.DEFAULT}] hover:bg-[${colors.emerald[700]}]`}
      onClick={() =>
        onClick ? onClick() : router.push(`/opportunities/${data.id}`)
      }
    >
      View details
    </Button>
  );

  // Very light neutral per guidance (zinc[200] #e4e4e7)
  const cardBg = "#E4E4E7";
  const cardBorder = "transparent";
  return (
    <Card
      className={`group relative overflow-hidden backdrop-blur-2xl transition hover:shadow-[0_10px_40px_${
        colors.ui.shadowDark
      }] ${disabled ? "opacity-60" : ""}`}
      style={{ backgroundColor: cardBg, borderColor: cardBorder }}
    >
      {/* Accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: colors.gradients.whiteToZinc }}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {(() => {
            const l = protocolLogo(data.protocol);
            return (
              <div
                aria-hidden
                className="grid h-9 w-9 place-items-center rounded-full text-sm font-semibold"
                style={{ background: l.bg, color: l.fg }}
                title={data.protocol}
              >
                {l.letter}
              </div>
            );
          })()}
          <div>
            <div
              className={`text-xs uppercase tracking-wide text-[${colors.zinc[500]}]`}
            >
              {data.protocol}
            </div>
            <div
              className={`mt-1 text-lg font-semibold text-[${colors.zinc[900]}]`}
            >
              {data.pair}
            </div>
          </div>
        </div>
        <Badge className={`${RISK_COLORS[data.risk]} border`}>
          {data.risk}
        </Badge>
      </div>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <div className={`text-xs text-[${colors.zinc[500]}]`}>APR</div>
          <div
            className={`text-2xl font-bold leading-tight text-[${colors.zinc[900]}]`}
          >
            {formatPct(data.apr, 1)}
          </div>
        </div>
        <div>
          <div className={`text-xs text-[${colors.zinc[500]}]`}>APY</div>
          <div
            className={`text-2xl font-bold leading-tight text-[${colors.zinc[900]}]`}
          >
            {formatPct(data.apy, 1)}
          </div>
        </div>
        <div>
          <div className={`text-xs text-[${colors.zinc[500]}]`}>TVL</div>
          <div
            className={`text-2xl font-bold leading-tight text-[${colors.zinc[900]}]`}
          >
            {formatTVL(data.tvlUsd)}
          </div>
        </div>
      </div>

      <div
        className={`mt-3 flex items-center justify-between text-xs text-[${colors.zinc[600]}]`}
      >
        <div>
          <span>Last updated {data.lastUpdated}</span>
          <span
            className={`ml-2 rounded-full bg-[${colors.zinc[100]}] px-2 py-0.5 text-[${colors.zinc[700]}]`}
          >
            source: demo
          </span>
        </div>
        <div
          className={`rounded-full bg-[${colors.zinc[100]}] px-2 py-0.5 text-[${colors.zinc[700]}]`}
        >
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
