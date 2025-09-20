"use client";
import React, { useState, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitCompare } from "lucide-react";
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
};
import { protocolLogo } from "@/lib/logos";
import { CompareModal } from "./CompareModal";

export interface CompareItem extends Opportunity {
  logo?: string;
  logoUrl?: string;
}

interface CompareContextType {
  items: CompareItem[];
  addItem: (item: CompareItem) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);

  const addItem = (item: CompareItem) => {
    setItems((prev) => {
      const exists = prev.find((x) => x.id === item.id);
      if (exists) return prev;
      if (prev.length >= 2) {
        return [prev[1], item]; // Replace oldest if at limit
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearItems = () => {
    setItems([]);
  };

  return (
    <CompareContext.Provider value={{ items, addItem, removeItem, clearItems }}>
      {children}
      <CompareBar />
    </CompareContext.Provider>
  );
}

function CompareBar() {
  const { items, removeItem, clearItems } = useCompare();
  const [showModal, setShowModal] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-xl ring-1 ring-black/5 backdrop-blur-xl">
            {/* Items */}
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                layoutId={`compare-item-${item.id}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 ring-1 ring-zinc-200"
              >
                <CompareItemSlot item={item} onRemove={() => removeItem(item.id)} />
              </motion.div>
            ))}
            
            {/* Add more hint */}
            {items.length < 2 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-3 text-xs text-zinc-500"
              >
                Add {2 - items.length} more to compare
              </motion.span>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 ml-2">
              {items.length === 2 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-orange)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-orange-700)] transition-colors"
                >
                  <GitCompare size={14} />
                  Compare
                </motion.button>
              )}
              
              <button
                onClick={clearItems}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 transition-colors"
                aria-label="Clear all"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modal */}
      {showModal && items.length === 2 && (
        <CompareModal
          itemA={items[0]}
          itemB={items[1]}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

function CompareItemSlot({ 
  item, 
  onRemove 
}: { 
  item: CompareItem; 
  onRemove: () => void;
}) {
  const logo = protocolLogo(item.protocol);
  
  return (
    <>
      <div 
        className="h-7 w-7 rounded-lg grid place-items-center text-xs font-bold overflow-hidden"
        style={{ backgroundColor: "var(--badge-lilac)", color: logo.fg }}
      >
        {item.protocol.toLowerCase() === 'arkadiko' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/logos/arkadiko.svg"
            alt="Arkadiko logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }}
          />
        ) : item.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.logoUrl}
            alt={`${item.protocol} logo`}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          logo.letter
        )}
      </div>
      <div className="flex-1">
        <div className="text-xs font-medium text-zinc-900">{item.protocol}</div>
        <div className="text-[10px] text-zinc-600">{item.pair}</div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="rounded-md p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 transition-colors"
        aria-label="Remove from comparison"
      >
        <X size={12} />
      </button>
    </>
  );
}
