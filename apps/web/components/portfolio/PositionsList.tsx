"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { colors } from "@/lib/colors";
import type { RedirectEntry } from "@/lib/mock";
import { getOpportunityById, RISK_COLORS } from "@/lib/mock";
import { protocolLogo } from "@/lib/logos";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Button, Badge } from "@/components/ui/primitives";

type Position = {
  id: string;
  protocol: string;
  pair: string;
  risk: "Low" | "Medium" | "High";
  tvlUsd: number;
  rewardToken: string;
  apr?: number;
  apy?: number;
  deposited: number;
  current: number;
  chain: string;
  txs: RedirectEntry[];
};

function buildPositions(rows: RedirectEntry[]): Position[] {
  const map: Record<string, Position> = {};
  for (const r of rows) {
    const opp = getOpportunityById(r.id);
    if (!opp) continue;
    const key = r.id;
    if (!map[key]) {
      map[key] = {
        id: opp.id,
        protocol: opp.protocol,
        pair: opp.pair,
        risk: opp.risk,
        tvlUsd: opp.tvlUsd,
        rewardToken: opp.rewardToken,
        apr: (opp as any).apr,
        apy: (opp as any).apy,
        deposited: 0,
        current: 0,
        chain: opp.chain,
        txs: [],
      };
    }
    const est = r.amount * (r.apr / 100) * (r.days / 365);
    map[key].deposited += r.amount;
    map[key].current += r.amount + est;
    map[key].txs.push(r);
  }
  return Object.values(map);
}

export const PositionsList: React.FC<{ rows: RedirectEntry[] }>
  = ({ rows }) => {
    const positions = React.useMemo(() => buildPositions(rows), [rows]);
    const [open, setOpen] = React.useState<Record<string, boolean>>({});
    const toggle = (id: string) => setOpen((s) => ({ ...s, [id]: !s[id] }));

    return (
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <AnimatePresence>
          {positions.map((p, idx) => {
            const l = protocolLogo(p.protocol);
            const data = Array.from({ length: 14 }).map((_, i) => ({ x: i, y: Number(((p.current / (p.deposited || 1)) + Math.sin(i) * 0.05).toFixed(4)) }));
            return (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * idx }}
                className={`rounded-3xl border border-black/5 bg-[var(--sand-50,#F6F4EF)] p-4 md:p-6`}
              >
                <motion.div whileHover={{ y: -2, scale: 1.01 }} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full text-sm font-semibold" style={{ background: l.bg, color: l.fg }}>{l.letter}</div>
                      <div>
                        <div className={`text-xs uppercase tracking-wide text-[${colors.zinc[500]}]`}>{p.protocol}</div>
                        <div className={`mt-1 text-lg font-semibold text-[${colors.zinc[900]}]`}>{p.pair}</div>
                      </div>
                    </div>
                    <Badge className={`${RISK_COLORS[p.risk]} border`}>{p.risk}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className={`text-[${colors.zinc[500]}]`}>Deposited</div>
                      <div className={`font-medium text-[${colors.zinc[900]}]`}>${p.deposited.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className={`text-[${colors.zinc[500]}]`}>Current Value</div>
                      <div className={`font-medium text-[${colors.zinc[900]}]`}>${p.current.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className={`text-[${colors.zinc[500]}]`}>APR/APY</div>
                      <div className={`font-medium text-[${colors.zinc[900]}]`}>{p.apr?.toFixed(1)}% / {p.apy?.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className={`text-[${colors.zinc[500]}]`}>TVL</div>
                      <div className={`font-medium text-[${colors.zinc[900]}]`}>${(p.tvlUsd/1_000_000).toFixed(2)}M</div>
                    </div>
                  </div>

                  <div className="h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data} margin={{ left: 0, right: 0, top: 6, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`gPos-${idx}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="y" stroke="#059669" strokeWidth={2} fill={`url(#gPos-${idx})`} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={`text-xs text-[${colors.zinc[600]}]`}>Reward: {p.rewardToken} (est.)</div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" onClick={() => toggle(p.id)}>Details</Button>
                      <Link href={`/opportunities/${p.id}`}><Button>Deposit</Button></Link>
                    </div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {open[p.id] && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden rounded-lg border bg-white/70 p-3 text-sm">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <div className={`text-[${colors.zinc[500]}]`}>Transaction History</div>
                          <div className="mt-1 space-y-1">
                            {p.txs.map((t, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <span>{t.action || "Deposit"} • {new Date(t.ts).toLocaleString()}</span>
                                {t.txid && (
                                  <a className={`text-[${colors.emerald[700]}] hover:underline`} href={`https://explorer.hiro.so/txid/${t.txid}?chain=testnet`} target="_blank" rel="noreferrer">Explorer</a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className={`text-[${colors.zinc[500]}]`}>Actions</div>
                          <div className="mt-2 flex gap-2">
                            <Button>Deposit</Button>
                            <Button variant="secondary" disabled>Withdraw</Button>
                          </div>
                          <div className={`mt-1 text-xs text-[${colors.zinc[500]}]`}>Router (B) links will appear here.</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  };
