'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type ChainKey = 'stacks' | 'ethereum' | 'solana';

type Props = {
  defaultChain?: ChainKey;
  onChange?: (c: ChainKey) => void;
  sticky?: boolean;
  className?: string;
};

const CHAINS: Array<{ key: ChainKey; label: string; disabled: boolean }> = [
  { key: 'stacks', label: 'Stacks', disabled: false },
  { key: 'ethereum', label: 'Ethereum', disabled: true },
  { key: 'solana', label: 'Solana', disabled: true },
];

export function ChainFilterPills({
  defaultChain = 'stacks',
  onChange,
  sticky = true,
  className,
}: Props) {
  const [active, setActive] = React.useState<ChainKey>(defaultChain);
  const reduceMotion = useReducedMotion();

  const wrapperClasses = [
    'w-full',
    sticky ? 'sticky top-0 z-20 backdrop-blur bg-white/70 border-t border-b border-neutral-200 supports-[backdrop-filter]:bg-white/60' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const barAnim = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: -6 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.25, ease: 'easeOut' },
      };

  const handleClick = (c: ChainKey, disabled: boolean) => {
    if (disabled) return;
    setActive(c);
    onChange?.(c);
  };

  return (
    <motion.div className={wrapperClasses} {...barAnim}>
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-center gap-2 py-3">
          {CHAINS.map(({ key, label, disabled }) => {
            const isActive = key === active;
            const base =
              'inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ' +
              'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
            const activeCls = 'text-white ring-[var(--brand-orange)] hover:bg-[var(--brand-orange-700)]';
            const inactiveCls = 'text-white hover:bg-white/15 ring-white/20';
            const disabledCls = 'opacity-50 cursor-not-allowed';

            const classes = [
              base,
              disabled ? disabledCls : isActive ? activeCls : inactiveCls,
            ].join(' ');

            const buttonStyle = isActive 
              ? { backgroundColor: 'var(--brand-orange)' } 
              : { backgroundColor: 'rgba(255, 255, 255, 0.1)' };

            return (
              <button
                key={key}
                type="button"
                aria-pressed={isActive}
                aria-label={`${label} filter`}
                className={classes}
                style={buttonStyle}
                disabled={disabled}
                title={disabled ? 'Coming soon' : undefined}
                onClick={() => handleClick(key, disabled)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default ChainFilterPills;