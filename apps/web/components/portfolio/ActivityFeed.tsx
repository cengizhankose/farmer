"use client";
import React from "react";
import type { RedirectEntry } from "@/lib/mock";
import { ActivityTable } from "@/components/portfolio/ActivityTable";
import { Button } from "@/components/ui/primitives";

export const ActivityFeed: React.FC<{ rows: RedirectEntry[] }>
  = ({ rows }) => {
    const [limit, setLimit] = React.useState(10);
    const [sort, setSort] = React.useState<{ key: "ts" | "amount" | "apr" | "days" | "est"; dir: "asc" | "desc" }>({ key: "ts", dir: "desc" });
    const sliced = React.useMemo(() => rows.slice(0, limit), [rows, limit]);
    return (
      <div className="mt-6">
        <ActivityTable rows={sliced} sort={sort} onSortChange={setSort} />
        {rows.length > limit && (
          <div className="mt-3 flex justify-center">
            <Button variant="outline" onClick={() => setLimit((l) => l + 10)}>Load more</Button>
          </div>
        )}
      </div>
    );
  };

