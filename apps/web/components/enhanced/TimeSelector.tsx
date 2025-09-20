"use client";

import React from "react";
import { motion } from "framer-motion";
import { Timeframe } from "@/types/enhanced-data";

interface TimeSelectorProps {
  timeframes: Timeframe[];
  selected: Timeframe;
  onChange: (timeframe: Timeframe) => void;
  disabled?: boolean;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  timeframes,
  selected,
  onChange,
  disabled = false
}) => {
  const getLabel = (timeframe: Timeframe): string => {
    switch (timeframe) {
      case '24H': return '24H';
      case '7D': return '7D';
      case '30D': return '30D';
      case '90D': return '90D';
      case '1Y': return '1Y';
      case 'ALL': return 'ALL';
      default: return timeframe;
    }
  };

  return (
    <div className="inline-flex bg-white/8 backdrop-blur ring-1 ring-white/15 rounded-lg p-1">
      {timeframes.map((timeframe) => (
        <motion.button
          key={timeframe}
          className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            selected === timeframe
              ? 'text-white bg-white/20'
              : 'text-white/60 hover:text-white/80 hover:bg-white/5'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => !disabled && onChange(timeframe)}
          disabled={disabled}
          whileHover={!disabled ? { scale: 1.02 } : {}}
          whileTap={!disabled ? { scale: 0.98 } : {}}
        >
          {getLabel(timeframe)}
          {selected === timeframe && (
            <motion.div
              className="absolute inset-0 bg-white/10 rounded-md"
              layoutId="activeTimeframe"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
};

// Common timeframe combinations
export const ChartTimeSelector: React.FC<{
  selected: Timeframe;
  onChange: (timeframe: Timeframe) => void;
  disabled?: boolean;
}> = (props) => (
  <TimeSelector
    timeframes={['7D', '30D', '90D']}
    {...props}
  />
);

export const ExtendedTimeSelector: React.FC<{
  selected: Timeframe;
  onChange: (timeframe: Timeframe) => void;
  disabled?: boolean;
}> = (props) => (
  <TimeSelector
    timeframes={['24H', '7D', '30D', '90D', '1Y', 'ALL']}
    {...props}
  />
);

export default TimeSelector;