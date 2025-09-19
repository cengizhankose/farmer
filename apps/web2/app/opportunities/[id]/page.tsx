'use client';

import React, { useState, useEffect } from 'react';
import { adapterManager } from "@adapters/core";
import { RiskScore, RiskBreakdown, RiskFactors } from "../../components/risk";
import {
  EnhancedRiskBreakdown,
  TVLMetricsCard,
  APRMetricsCard,
  VolumeMetricsCard,
  ParticipantMetricsCard,
  RiskMetricsCard,
  TVLChart,
  APRChart,
  VolumeChart,
  CombinedChart,
  ValueProjections,
  ChartTimeSelector,
  Timeframe
} from "../../components/enhanced";
import { EnhancedOpportunityData } from "../../types/enhanced-data";

export default function OpportunityDetailPage({
  params
}: {
  params: { id: string }
}) {
  const [opportunity, setOpportunity] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('30D');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adapterManager.getEnrichedOpportunityById(params.id);
        setOpportunity(data);
      } catch (error) {
        console.error('Error fetching opportunity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', color: '#6b7280', marginBottom: '1rem' }}>
            Loading opportunity data...
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        border: '1px solid #fecaca',
        color: '#991b1b'
      }}>
        <h2 style={{ margin: '0 0 1rem 0' }}>Opportunity Not Found</h2>
        <p style={{ margin: 0 }}>The requested opportunity could not be found.</p>
      </div>
    );
  }

  // For demo purposes, create mock enhanced data
  // In a real implementation, this would come from the enhanced data services
  const mockEnhancedData: EnhancedOpportunityData = {
    id: opportunity.id,
    protocol: opportunity.protocol,
    pool: opportunity.pool,
    chain: opportunity.chain,
    tokens: opportunity.tokens,
    tvlUsd: opportunity.tvlUsd || 0,
    apr: opportunity.apr,
    apy: opportunity.apy,
    volume24h: opportunity.volume24h || 0,
    fees24h: opportunity.fees24h || 0,
    participants: {
      uniqueParticipants: Math.floor(Math.random() * 1000) + 100,
      transactionCount: Math.floor(Math.random() * 10000) + 1000,
      totalVolume: (opportunity.volume24h || 0) * 30,
      averageTransactionSize: (opportunity.volume24h || 0) / Math.max(1, Math.floor(Math.random() * 100) + 10),
      whaleTransactionCount: Math.floor(Math.random() * 100) + 10,
      activeUsers24h: Math.floor(Math.random() * 100) + 20,
      giniCoefficient: Math.random() * 0.8 + 0.2,
      concentrationRisk: Math.random() * 0.6 + 0.2,
      newUsers24h: Math.floor(Math.random() * 50) + 5,
      retentionRate: Math.random() * 0.4 + 0.6,
      participantGrowth7d: (Math.random() - 0.5) * 0.1,
      participantGrowth30d: (Math.random() - 0.5) * 0.3,
    },
    liquidity: {
      currentTvl: opportunity.tvlUsd || 0,
      volume24h: opportunity.volume24h || 0,
      uniqueParticipants24h: Math.floor(Math.random() * 500) + 50,
      whaleTransactionCount: Math.floor(Math.random() * 50) + 5,
      liquidityDepth: {
        depth1m: (opportunity.tvlUsd || 0) * 0.05,
        depth5m: (opportunity.tvlUsd || 0) * 0.15,
        depth10m: (opportunity.tvlUsd || 0) * 0.25,
        depth1h: (opportunity.tvlUsd || 0) * 0.4,
      },
      turnoverRatio: Math.min(1, (opportunity.volume24h || 0) / Math.max(1, opportunity.tvlUsd || 0)),
      volumeTvlRatio: Math.min(2, (opportunity.volume24h || 0) / Math.max(1, opportunity.tvlUsd || 0)),
      liquidityScore: Math.random() * 100,
      marketDepthScore: Math.random() * 100,
    },
    stability: {
      tvlVolatility30d: Math.random() * 0.3 + 0.05,
      maxDrawdown30d: Math.random() * 0.4 + 0.1,
      tvlTrend7d: (Math.random() - 0.5) * 0.1,
      priceVolatility30d: Math.random() * 0.5 + 0.1,
      currentTvl: opportunity.tvlUsd,
      currentApr: opportunity.apr,
      priceReturn24h: (Math.random() - 0.5) * 0.1,
      volatilityScore: Math.random() * 100,
      stabilityScore: Math.random() * 100,
      drawdownRecovery: Math.random() * 0.8 + 0.2,
      trendConsistency: Math.random() * 0.8 + 0.2,
      riskAdjustedReturn: Math.random() * 2 - 1,
    },
    yield: {
      apr: opportunity.apr,
      apy: opportunity.apy,
      tradingFeeApr: opportunity.apr * 0.3,
      rewardTokenApr: opportunity.apr * 0.7,
      rewardTokenPrice: Math.random() * 10 + 0.1,
      rewardTokenVolatility30d: Math.random() * 0.4 + 0.1,
      aprVolatility30d: Math.random() * 0.2 + 0.05,
      yieldVolatility30d: Math.random() * 0.25 + 0.05,
      sustainableApr: opportunity.apr * 0.8,
      yieldScore: Math.random() * 100,
      rewardDependencyRatio: 0.7,
      incentiveQuality: Math.random() * 0.8 + 0.2,
      earningsConsistency: Math.random() * 0.8 + 0.2,
    },
    concentration: {
      top10HolderPercentage: Math.random() * 60 + 20,
      holderCount: Math.floor(Math.random() * 1000) + 100,
      giniCoefficient: Math.random() * 0.7 + 0.3,
      herfindahlIndex: Math.random() * 0.5 + 0.1,
      largestHolderPercentage: Math.random() * 40 + 10,
      whaleTransactionRatio: Math.random() * 0.6 + 0.2,
      concentrationScore: Math.random() * 100,
      distributionScore: Math.random() * 100,
      decentralizationLevel: Math.random() > 0.66 ? 'high' : Math.random() > 0.33 ? 'medium' : 'low',
    },
    momentum: {
      tvlGrowth7d: (Math.random() - 0.5) * 0.2,
      tvlGrowth30d: (Math.random() - 0.5) * 0.5,
      volumeGrowth7d: (Math.random() - 0.5) * 0.3,
      volumeGrowth30d: (Math.random() - 0.5) * 0.6,
      participantGrowth7d: (Math.random() - 0.5) * 0.1,
      momentumScore: Math.random() * 100,
      trendStrength: Math.random() * 0.8 + 0.2,
      sentimentIndicator: Math.random() * 2 - 1,
      growthSustainability: Math.random() * 0.8 + 0.2,
    },
    blockchain: {
      contractTransactions: Math.floor(Math.random() * 50000) + 5000,
      contractVolume: (opportunity.tvlUsd || 0) * 10,
      uniqueSenders: Math.floor(Math.random() * 1000) + 100,
      uniqueReceivers: Math.floor(Math.random() * 800) + 80,
      averageGasUsed: Math.floor(Math.random() * 500) + 100,
      transactionFrequency: Math.random() * 100 + 10,
      networkCongestion: Math.random() * 0.5 + 0.1,
      healthScore: Math.random() * 100,
      activityScore: Math.random() * 100,
    },
    riskScore: opportunity.riskScore || {
      total: Math.floor(Math.random() * 100),
      label: 'medium' as const,
      components: {
        liquidity: Math.floor(Math.random() * 100),
        stability: Math.floor(Math.random() * 100),
        yield: Math.floor(Math.random() * 100),
        concentration: Math.floor(Math.random() * 100),
        momentum: Math.floor(Math.random() * 100),
      },
      drivers: ['TVL Volatility', 'Concentration Risk'],
      confidence: 'medium' as const,
    },
    historicalData: {
      tvl_7: Array(7).fill(0).map(() => (opportunity.tvlUsd || 0) * (0.8 + Math.random() * 0.4)),
      tvl_30: Array(30).fill(0).map(() => (opportunity.tvlUsd || 0) * (0.7 + Math.random() * 0.6)),
      tvl_90: Array(90).fill(0).map(() => (opportunity.tvlUsd || 0) * (0.6 + Math.random() * 0.8)),
      apr_30: Array(30).fill(0).map(() => opportunity.apr * (0.8 + Math.random() * 0.4)),
      apr_90: Array(90).fill(0).map(() => opportunity.apr * (0.7 + Math.random() * 0.6)),
      vol_30: Array(30).fill(0).map(() => (opportunity.volume24h || 0) * (0.6 + Math.random() * 0.8)),
    },
    chartData: {
      tvl: {
        timestamps: Array(30).fill(0).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return date.toISOString();
        }),
        tvlUsd: Array(30).fill(0).map(() => (opportunity.tvlUsd || 0) * (0.8 + Math.random() * 0.4)),
        apy: Array(30).fill(0).map(() => opportunity.apy * (0.9 + Math.random() * 0.2)),
        volumeUsd: Array(30).fill(0).map(() => (opportunity.volume24h || 0) * (0.7 + Math.random() * 0.6)),
      },
      apr: {
        timestamps: Array(30).fill(0).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return date.toISOString();
        }),
        tvlUsd: Array(30).fill(0).map(() => (opportunity.tvlUsd || 0) * (0.8 + Math.random() * 0.4)),
        apy: Array(30).fill(0).map(() => opportunity.apy * (0.9 + Math.random() * 0.2)),
        apyBase: Array(30).fill(0).map(() => opportunity.apy * 0.3 * (0.9 + Math.random() * 0.2)),
        apyReward: Array(30).fill(0).map(() => opportunity.apy * 0.7 * (0.9 + Math.random() * 0.2)),
      },
      volume: {
        timestamps: Array(30).fill(0).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return date.toISOString();
        }),
        tvlUsd: Array(30).fill(0).map(() => (opportunity.tvlUsd || 0) * (0.8 + Math.random() * 0.4)),
        apy: Array(30).fill(0).map(() => opportunity.apy * (0.9 + Math.random() * 0.2)),
        volumeUsd: Array(30).fill(0).map(() => (opportunity.volume24h || 0) * (0.7 + Math.random() * 0.6)),
      },
    },
    projections: [
      {
        timeframe: '7d',
        scenarios: {
          bearish: {
            projectedValue: (opportunity.tvlUsd || 0) * 0.95,
            probability: 0.2,
            confidence: 0.7,
            range: [(opportunity.tvlUsd || 0) * 0.9, (opportunity.tvlUsd || 0) * 1.0],
          },
          neutral: {
            projectedValue: (opportunity.tvlUsd || 0) * 1.02,
            probability: 0.6,
            confidence: 0.8,
            range: [(opportunity.tvlUsd || 0) * 0.98, (opportunity.tvlUsd || 0) * 1.06],
          },
          bullish: {
            projectedValue: (opportunity.tvlUsd || 0) * 1.10,
            probability: 0.2,
            confidence: 0.6,
            range: [(opportunity.tvlUsd || 0) * 1.05, (opportunity.tvlUsd || 0) * 1.15],
          },
        },
        expectedValue: (opportunity.tvlUsd || 0) * 1.02,
        volatility: 0.15,
        confidenceInterval: [(opportunity.tvlUsd || 0) * 0.95, (opportunity.tvlUsd || 0) * 1.10],
        simulationCount: 10000,
      },
      {
        timeframe: '30d',
        scenarios: {
          bearish: {
            projectedValue: (opportunity.tvlUsd || 0) * 0.85,
            probability: 0.25,
            confidence: 0.75,
            range: [(opportunity.tvlUsd || 0) * 0.75, (opportunity.tvlUsd || 0) * 0.95],
          },
          neutral: {
            projectedValue: (opportunity.tvlUsd || 0) * 1.08,
            probability: 0.55,
            confidence: 0.85,
            range: [(opportunity.tvlUsd || 0) * 1.0, (opportunity.tvlUsd || 0) * 1.16],
          },
          bullish: {
            projectedValue: (opportunity.tvlUsd || 0) * 1.25,
            probability: 0.20,
            confidence: 0.65,
            range: [(opportunity.tvlUsd || 0) * 1.15, (opportunity.tvlUsd || 0) * 1.35],
          },
        },
        expectedValue: (opportunity.tvlUsd || 0) * 1.08,
        volatility: 0.25,
        confidenceInterval: [(opportunity.tvlUsd || 0) * 0.85, (opportunity.tvlUsd || 0) * 1.30],
        simulationCount: 10000,
      },
      {
        timeframe: '90d',
        scenarios: {
          bearish: {
            projectedValue: (opportunity.tvlUsd || 0) * 0.7,
            probability: 0.20,
            confidence: 0.70,
            range: [(opportunity.tvlUsd || 0) * 0.6, (opportunity.tvlUsd || 0) * 0.8],
          },
          neutral: {
            projectedValue: (opportunity.tvlUsd || 0) * 1.15,
            probability: 0.60,
            confidence: 0.80,
            range: [(opportunity.tvlUsd || 0) * 1.0, (opportunity.tvlUsd || 0) * 1.3],
          },
          bullish: {
            projectedValue: (opportunity.tvlUsd || 0) * 1.5,
            probability: 0.20,
            confidence: 0.60,
            range: [(opportunity.tvlUsd || 0) * 1.3, (opportunity.tvlUsd || 0) * 1.7],
          },
        },
        expectedValue: (opportunity.tvlUsd || 0) * 1.15,
        volatility: 0.35,
        confidenceInterval: [(opportunity.tvlUsd || 0) * 0.75, (opportunity.tvlUsd || 0) * 1.55],
        simulationCount: 10000,
      },
    ],
    lastUpdated: Date.now(),
    dataQuality: {
      completeness: Math.random() * 0.3 + 0.7,
      reliability: Math.random() * 0.3 + 0.7,
      timeliness: Math.random() * 0.2 + 0.8,
      overallScore: Math.random() * 0.3 + 0.7,
    },
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
            {opportunity.protocol} - {opportunity.pool}
          </h1>
          {opportunity.logoUrl && (
            <img
              src={opportunity.logoUrl}
              alt={opportunity.protocol}
              style={{ width: '48px', height: '48px', borderRadius: '50%' }}
            />
          )}
        </div>
        <p style={{ margin: 0, fontSize: '1rem', color: '#6b7280' }}>
          {opportunity.chain} • {opportunity.tokens.join(' / ')}
        </p>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <TVLMetricsCard
          tvl={mockEnhancedData.tvlUsd}
          change24h={mockEnhancedData.momentum.tvlGrowth7d * 100}
          trend={mockEnhancedData.momentum.tvlGrowth7d > 0 ? 'up' : mockEnhancedData.momentum.tvlGrowth7d < 0 ? 'down' : 'stable'}
        />
        <APRMetricsCard
          apr={mockEnhancedData.apr}
          change24h={mockEnhancedData.yield.aprVolatility30d * 100}
          volatility={mockEnhancedData.yield.aprVolatility30d}
        />
        <VolumeMetricsCard
          volume={mockEnhancedData.volume24h}
          change24h={mockEnhancedData.momentum.volumeGrowth7d * 100}
          participants={mockEnhancedData.participants.uniqueParticipants}
        />
        <ParticipantMetricsCard
          participants={mockEnhancedData.participants.uniqueParticipants}
          growth={mockEnhancedData.participants.participantGrowth7d * 100}
          newUsers={mockEnhancedData.participants.newUsers24h}
        />
        <RiskMetricsCard
          riskScore={mockEnhancedData.riskScore.total}
          confidence={mockEnhancedData.riskScore.confidence}
        />
      </div>

      {/* Enhanced Risk Analysis */}
      <div style={{ marginBottom: '3rem' }}>
        <EnhancedRiskBreakdown
          riskScore={mockEnhancedData.riskScore}
          enhancedData={{
            liquidity: mockEnhancedData.liquidity,
            stability: mockEnhancedData.stability,
            yield: mockEnhancedData.yield,
            concentration: mockEnhancedData.concentration,
            momentum: mockEnhancedData.momentum,
          }}
        />
      </div>

      {/* Charts Section */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
            Performance Metrics
          </h2>
          <ChartTimeSelector
            selected={selectedTimeframe}
            onChange={setSelectedTimeframe}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '1.5rem'
        }}>
          <TVLChart
            data={mockEnhancedData.chartData.tvl}
            timeframe={selectedTimeframe}
            height={300}
            title="TVL Over Time"
          />
          <APRChart
            data={mockEnhancedData.chartData.apr}
            timeframe={selectedTimeframe}
            height={300}
            title="APR Over Time"
          />
          <VolumeChart
            data={mockEnhancedData.chartData.volume}
            timeframe={selectedTimeframe}
            height={300}
            title="Volume Over Time"
          />
          <CombinedChart
            data={mockEnhancedData.chartData.tvl}
            timeframe={selectedTimeframe}
            height={300}
            title="Combined TVL & APR"
          />
        </div>
      </div>

      {/* Value Projections */}
      <div style={{ marginBottom: '3rem' }}>
        <ValueProjections
          projections={mockEnhancedData.projections}
          currentTvl={mockEnhancedData.tvlUsd}
          showScenarios={true}
          showChart={true}
        />
      </div>

      {/* Action Section */}
      <div style={{
        padding: '2rem',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <button
          disabled
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#d1d5db',
            color: '#6b7280',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'not-allowed',
            marginBottom: '0.75rem'
          }}
        >
          Deposit (Router Coming Soon)
        </button>
        <p style={{
          margin: 0,
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          Router contract deployment in progress. Deposits will be enabled once security audits are complete.
        </p>
      </div>

      {/* Data Quality & Metadata */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
            Data Quality
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Completeness:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                {(mockEnhancedData.dataQuality.completeness * 100).toFixed(0)}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Reliability:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                {(mockEnhancedData.dataQuality.reliability * 100).toFixed(0)}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Timeliness:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                {(mockEnhancedData.dataQuality.timeliness * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
            Blockchain Metrics
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Transactions:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                {mockEnhancedData.blockchain.contractTransactions.toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Unique Senders:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                {mockEnhancedData.blockchain.uniqueSenders.toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Health Score:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                {mockEnhancedData.blockchain.healthScore.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: '#fef3c7',
        borderRadius: '8px',
        border: '1px solid #f59e0b20'
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#92400e' }}>
              BETA - Experimental Software
            </h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5' }}>
              This is experimental software and not financial advice. The enhanced data, projections, and risk analysis are for informational purposes only. Always do your own research before investing. Past performance does not guarantee future results.
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#a16207' }}>
              Data updated: {new Date(mockEnhancedData.lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Add CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}