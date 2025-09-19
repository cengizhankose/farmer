"use client";
import React from "react";
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
import { ActivityTable } from "@/components/portfolio/ActivityTable";
import { Button } from "@/components/ui/primitives";

export const ActivityFeed: React.FC<{ rows: RedirectEntry[] }>
  = ({ rows }) => {
    const [limit, setLimit] = React.useState(10);
    const [sort, setSort] = React.useState<{ key: "ts" | "amount" | "apr" | "days" | "est"; dir: "asc" | "desc" }>({ key: "ts", dir: "desc" });
    const [highlightTs, setHighlightTs] = React.useState<number | null>(null);
    const lastTsRef = React.useRef<number>(0);

    React.useEffect(() => {
      if (rows.length === 0) return;
      const newestTs = rows[0]?.ts || 0;
      if (newestTs > lastTsRef.current) {
        setHighlightTs(newestTs);
        lastTsRef.current = newestTs;
        const t = setTimeout(() => setHighlightTs(null), 1200);
        return () => clearTimeout(t);
      }
    }, [rows]);

    const sliced = React.useMemo(() => rows.slice(0, limit), [rows, limit]);
    return (
      <div className="mt-6">
        <ActivityTable rows={sliced} sort={sort} onSortChange={setSort} highlightTs={highlightTs} />
        {rows.length > limit && (
          <div className="mt-3 flex justify-center">
            <Button variant="outline" onClick={() => setLimit((l) => l + 10)}>Load more</Button>
          </div>
        )}
      </div>
    );
  };
