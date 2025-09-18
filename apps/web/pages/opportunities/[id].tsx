"use client";
import React from "react";
import { useRouter } from "next/router";
import { getOpportunityById } from "@/lib/mock";
import { OpportunityHero } from "@/components/opportunity/OpportunityHero";
import { OpportunityOverviewCard } from "@/components/opportunity/OpportunityOverviewCard";
import { DepositCalculator } from "@/components/opportunity/DepositCalculator";
import { RiskAnalysis } from "@/components/opportunity/RiskAnalysis";
import { useCompare } from "@/components/opportunity/CompareBar";
import { GitCompare, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function OpportunityDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const data = getOpportunityById(id);
  const { addItem } = useCompare();

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-semibold text-zinc-900">Opportunity not found</h2>
          <p className="mt-2 text-zinc-600">We couldn't locate this opportunity.</p>
          <Link 
            href="/opportunities" 
            className="mt-4 inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to opportunities
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleCompare = () => {
    addItem(data);
  };

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero Section */}
        <OpportunityHero data={data} />

        {/* Compare Button */}
        <div className="mt-6 flex justify-end">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCompare}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50 transition-colors"
          >
            <GitCompare size={16} />
            Add to Compare
          </motion.button>
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Overview */}
            <OpportunityOverviewCard data={data} />
            
            {/* Risk Analysis */}
            <RiskAnalysis data={data} />
          </div>

          {/* Right Column - 1/3 */}
          <div className="lg:col-span-1">
            <DepositCalculator data={data} />
          </div>
        </div>
      </div>
    </main>
  );
}

