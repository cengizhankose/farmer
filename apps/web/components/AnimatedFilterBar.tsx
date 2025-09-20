"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

type RiskKey = "all" | "low" | "medium" | "high";
type SortKey =
  | "apr-desc" | "apr-asc"
  | "apy-desc" | "apy-asc"
  | "tvl-desc" | "tvl-asc"
  | "risk-desc" | "risk-asc";

export default function AnimatedFilterBar({
  defaultRisk = "all",
  defaultSort = "apr-desc",
  onRiskChange,
  onSortChange,
  query = "",
  onQueryChange,
  sticky = true,
}: {
  defaultRisk?: RiskKey;
  defaultSort?: SortKey;
  onRiskChange?: (r: RiskKey) => void;
  onSortChange?: (s: SortKey) => void;
  query?: string;
  onQueryChange?: (q: string) => void;
  sticky?: boolean;
}) {
  return (
    <div
      className={clsx(
        "w-full",
        sticky && "sticky top-0 z-30 backdrop-blur bg-white/70 supports-[backdrop-filter]:bg-white/60"
      )}
      role="toolbar"
      aria-label="Filters and sorting"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Search field - left side */}
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search protocol or pair"
            value={query}
            onChange={(e) => onQueryChange?.(e.target.value)}
            className="w-full rounded-full border border-black/5 bg-[var(--sand-50)] px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 shadow-sm transition-colors focus:border-[var(--brand-orange)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-orange)]/20"
          />
        </div>
        
        {/* Filters - right side */}
        <div className="flex items-center gap-3 ml-auto">
          <Menu
            label="Risk"
            items={[
              { key: "all", label: "All risks" },
              { key: "low", label: "Low" },
              { key: "medium", label: "Medium" },
              { key: "high", label: "High" },
            ]}
            onSelect={(k) => onRiskChange?.(k as RiskKey)}
            defaultKey={defaultRisk}
          />
          <Menu
            label="Sort"
            items={[
              { group: "APR", options: [
                { key: "apr-desc", label: "High → Low" },
                { key: "apr-asc", label: "Low → High" },
              ]},
              { group: "APY", options: [
                { key: "apy-desc", label: "High → Low" },
                { key: "apy-asc", label: "Low → High" },
              ]},
              { group: "TVL", options: [
                { key: "tvl-desc", label: "High → Low" },
                { key: "tvl-asc", label: "Low → High" },
              ]},
              { group: "Risk", options: [
                { key: "risk-desc", label: "High → Low" },
                { key: "risk-asc", label: "Low → High" },
              ]},
            ]}
            onSelect={(k) => onSortChange?.(k as SortKey)}
            defaultKey={defaultSort}
            orangeSelected // turuncu tema
            wide
          />
        </div>
      </div>
    </div>
  );
}

function useOutsideClose<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return ref;
}

function Menu({
  label,
  items,
  onSelect,
  defaultKey,
  orangeSelected,
  wide,
}: {
  label: string;
  items:
    | { key: string; label: string }[]
    | { group: string; options: { key: string; label: string }[] }[];
  onSelect: (key: string) => void;
  defaultKey?: string;
  orangeSelected?: boolean;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(defaultKey);
  const ref = useOutsideClose<HTMLDivElement>(() => setOpen(false));

  const activeStyles = orangeSelected
    ? "bg-[var(--brand-orange)] text-white ring-[var(--brand-orange)]"
    : "bg-[var(--brand-orange)] text-white ring-[var(--brand-orange)]";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={clsx(
          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ring-1 transition",
          open
            ? activeStyles
            : "bg-[var(--sand-50)] border border-black/5 text-zinc-800 ring-black/5 hover:bg-white hover:shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-orange)]/20"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <Chevron open={open} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={clsx(
              "absolute left-0 mt-2 rounded-2xl bg-white shadow-lg ring-1 ring-black/5",
              wide ? "w-64" : "w-48"
            )}
          >
            {Array.isArray(items) && items.length > 0 && "group" in items[0] ? (
              <div className="max-h-[60vh] overflow-auto p-2">
                {(items as { group: string; options: { key: string; label: string }[] }[]).map((g) => (
                  <div key={g.group} className="mb-1 last:mb-0">
                    <div className="px-2 py-1 text-[11px] uppercase tracking-wide text-neutral-500">
                      {g.group}
                    </div>
                    {g.options.map((opt) => (
                      <MenuItem
                        key={opt.key}
                        active={current === opt.key}
                        label={opt.label}
                        onClick={() => {
                          setCurrent(opt.key);
                          onSelect(opt.key);
                          setOpen(false);
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2">
                {(items as { key: string; label: string }[]).map((opt) => (
                  <MenuItem
                    key={opt.key}
                    active={current === opt.key}
                    label={opt.label}
                    onClick={() => {
                      setCurrent(opt.key);
                      onSelect(opt.key);
                      setOpen(false);
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({
  active,
  label,
  onClick,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      role="menuitemradio"
      aria-checked={!!active}
      onClick={onClick}
      className={clsx(
        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm",
        active
          ? "bg-neutral-100 text-neutral-900"
          : "text-neutral-700 hover:bg-neutral-50"
      )}
    >
      <span>{label}</span>
      {active && <span className="text-xs text-neutral-500">✓</span>}
    </button>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      className="opacity-80"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.18 }}
    >
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </motion.svg>
  );
}