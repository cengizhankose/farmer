"use client";
import React from "react";
import Link from "next/link";
// Local type definitions
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/primitives";
import { colors } from "@/lib/colors";

type SortKey = "ts" | "amount" | "apr" | "days" | "est";
type SortDir = "asc" | "desc";

export const ActivityTable: React.FC<{
  rows: RedirectEntry[];
  sort: { key: SortKey; dir: SortDir };
  onSortChange: (s: { key: SortKey; dir: SortDir }) => void;
  highlightTs?: number | null;
}> = ({ rows, sort, onSortChange, highlightTs = null }) => {
  const sorted = React.useMemo(() => {
    const withEst = rows.map((r) => ({ ...r, est: r.amount * (r.apr / 100) * (r.days / 365) }));
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...withEst].sort((a, b) => {
      const va = a[sort.key];
      const vb = b[sort.key];
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [rows, sort]);

  const th = (label: string, key?: SortKey, alignRight?: boolean) => {
    const active = key && sort.key === key;
    const caret = active ? (sort.dir === "asc" ? "↑" : "↓") : "";
    const className = `${alignRight ? "text-right" : "text-left"}`;
    return (
      <TableHead className={className} onClick={() => key && onSortChange({ key, dir: active && sort.dir === "desc" ? "asc" : "desc" })} style={{ cursor: key ? "pointer" : "default" }}>
        {label} {caret}
      </TableHead>
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {th("When", "ts")}
            {th("Protocol")}
            {th("Pair")}
            {th("Amount", "amount", true)}
            {th("APR", "apr", true)}
            {th("Days", "days", true)}
            {th("Est. Return", "est", true)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((r, idx) => {
            const est = (r.amount * (r.apr / 100) * (r.days / 365)).toFixed(2);
            const when = new Date(r.ts).toLocaleString();
            const highlight = highlightTs && r.ts >= highlightTs;
            return (
              <TableRow key={idx} className={highlight ? "bg-amber-50 transition-colors" : undefined}>
                <TableCell>{when}</TableCell>
                <TableCell>{r.protocol}</TableCell>
                <TableCell>
                  <Link href={`/opportunities/${r.id}`} className={`text-[${colors.emerald[700]}] hover:underline`}>{r.pair}</Link>
                </TableCell>
                <TableCell className="text-right">${r.amount}</TableCell>
                <TableCell className="text-right">{r.apr}%</TableCell>
                <TableCell className="text-right">{r.days}</TableCell>
                <TableCell className="text-right">${est}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
