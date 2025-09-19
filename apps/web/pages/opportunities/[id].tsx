"use client";
import React from "react";
import { useRouter } from "next/router";
import { Logger } from "@/lib/adapters/real";
import { OpportunityHero } from "@/components/opportunity/OpportunityHero";
import { OpportunityOverviewCard } from "@/components/opportunity/OpportunityOverviewCard";
import { DepositCalculator } from "@/components/opportunity/DepositCalculator";
import { RiskAnalysis } from "@/components/opportunity/RiskAnalysis";
import { useCompare } from "@/components/opportunity/CompareBar";
import { GitCompare, ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type CardOpportunity = {
  id: string;
  protocol: string;
  pair: string;
  chain: string;
  apr: number; // percent
  apy: number; // percent
  risk: "Low" | "Medium" | "High";
  tvlUsd: number;
  rewardToken: string;
  lastUpdated: string; // label like 5m, 2h
  originalUrl: string;
  summary: string;
  // Extended metadata may exist but is not required here
  ilRisk?: string;
  exposure?: string;
  volume24h?: number;
};

export default function OpportunityDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addItem } = useCompare();
  
  const [data, setData] = React.useState<CardOpportunity | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  
  // Load opportunity data
  React.useEffect(() => {
    if (!id) return;
    
    const opportunityId = Array.isArray(id) ? id[0] : id;
    
    let mounted = true;
    
    async function loadRealOpportunity() {
      try {
        setLoading(true);
        setError(null);
        
        Logger.info(`🚀 Loading REAL opportunity detail via API: ${opportunityId}`);
        const resp = await fetch(`/api/opportunities/${opportunityId}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        const opportunity: CardOpportunity | null = json.item || null;
        
        if (!mounted) return;
        
        if (opportunity) {
          Logger.info(`✅ Loaded opportunity detail from REAL APIs: ${opportunityId}`);
          Logger.debug(`📊 Data: ${opportunity.protocol} - ${opportunity.pair} - ${opportunity.apy.toFixed(1)}% APY`);
          setData(opportunity);
        } else {
          Logger.warn(`❌ Opportunity not found in real data: ${opportunityId}`);
          setError('Opportunity not found in real data sources');
        }
        
      } catch (fetchError) {
        Logger.error(`💥 FAILED to load real data for ${opportunityId}`, fetchError);
        setError(`Real data loading failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
        setData(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    
    loadRealOpportunity();
    
    return () => {
      mounted = false;
    };
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Loading opportunity...</h2>
          <p className="mt-2 text-gray-600">Fetching the latest data</p>
        </motion.div>
      </div>
    );
  }
  
  // Error or not found state
  if (!data || error === 'Opportunity not found') {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="typo-404-h">Opportunity not found</h2>
          <p className="typo-404-p">We couldn't locate this opportunity.</p>
          <Link 
            href="/opportunities" 
            className="typo-link-emerald mt-4 inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to opportunities
          </Link>
        </motion.div>
      </div>
    );
  }


  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-7xl px-6 py-8">
        
        {/* Real Data Status Indicator */}
        {!error && !loading && data && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  🚀 Live Data Active
                </p>
                <p className="text-sm text-green-700">
                  Real-time data from DeFiLlama API and Arkadiko Protocol • ID: {data.id}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Indicator */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  ❌ Real Data Loading Failed
                </p>
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Hero Section */}
        <OpportunityHero data={data} />

        {/* Compare Button */}
        <div className="mt-6 flex justify-end">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              Logger.info(`🔄 Adding opportunity to compare: ${data.id}`);
              // CompareItem matches CardOpportunity structurally (logo? optional)
              addItem(data as unknown as import("@/components/opportunity/CompareBar").CompareItem);
            }}
            className="typo-btn-sm-muted inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 ring-1 ring-zinc-200 hover:bg-zinc-50 transition-all hover:shadow-sm"
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
