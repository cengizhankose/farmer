"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, AlertTriangle, Shield, TrendingUp } from "lucide-react";
// Temporary RiskScore type until @shared/core import is fixed
interface RiskScore {
  total: number;
  confidence: 'high' | 'medium' | 'low';
  components: {
    liquidity: number;
    stability: number;
    yield: number;
    concentration: number;
    momentum: number;
  };
  drivers?: string[];
}

interface RiskTooltipProps {
  riskScore: RiskScore;
  children: React.ReactNode;
}

const RiskTooltip: React.FC<RiskTooltipProps> = ({ riskScore, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const getRiskColor = (score: number): string => {
    if (score <= 33) return 'text-green-400';
    if (score <= 66) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskLevel = (score: number): string => {
    if (score <= 33) return 'Low';
    if (score <= 66) return 'Medium';
    return 'High';
  };

  const getRiskIcon = (score: number) => {
    if (score <= 33) return <Shield className="h-4 w-4 text-green-400" />;
    if (score <= 66) return <TrendingUp className="h-4 w-4 text-yellow-400" />;
    return <AlertTriangle className="h-4 w-4 text-red-400" />;
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-80 p-4 bg-slate-900 border border-slate-700 rounded-lg shadow-xl"
            style={{ bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' }}
          >
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="border-4 border-transparent border-t-slate-700"></div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              {getRiskIcon(riskScore.total)}
              <div>
                <h3 className="text-white font-semibold">Risk Analysis</h3>
                <p className={`text-sm font-medium ${getRiskColor(riskScore.total)}`}>
                  {getRiskLevel(riskScore.total)} Risk ({riskScore.total}/100)
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Liquidity Risk</span>
                <span className="text-white">{Math.round(riskScore.components.liquidity)}/100</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Stability Risk</span>
                <span className="text-white">{Math.round(riskScore.components.stability)}/100</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Yield Risk</span>
                <span className="text-white">{Math.round(riskScore.components.yield)}/100</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Concentration Risk</span>
                <span className="text-white">{Math.round(riskScore.components.concentration)}/100</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Momentum Risk</span>
                <span className="text-white">{Math.round(riskScore.components.momentum)}/100</span>
              </div>
            </div>

            {riskScore.drivers && riskScore.drivers.length > 0 && (
              <div className="border-t border-slate-700 pt-3">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Key Risk Drivers</h4>
                <ul className="space-y-1">
                  {riskScore.drivers.slice(0, 3).map((driver, index) => (
                    <li key={index} className="text-xs text-slate-400 flex items-start gap-2">
                      <Info className="h-3 w-3 text-slate-500 mt-0.5 flex-shrink-0" />
                      {driver}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
              <span className="text-xs text-slate-500">Confidence</span>
              <span className={`text-xs font-medium ${
                riskScore.confidence === 'high' ? 'text-green-400' :
                riskScore.confidence === 'medium' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {riskScore.confidence.toUpperCase()}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RiskTooltip;