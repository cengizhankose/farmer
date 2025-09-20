import type { NextApiRequest, NextApiResponse } from 'next';
import { realDataAdapter } from '@/lib/adapters/real';

type CardOpportunity = {
  id: string;
  protocol: string;
  pair: string;
  chain: string;
  apr: number;
  apy: number;
  risk: 'Low' | 'Medium' | 'High';
  tvlUsd: number;
  rewardToken: string;
  lastUpdated: string;
  originalUrl: string;
  summary: string;
  source?: 'live' | 'demo';
  logoUrl?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    items: CardOpportunity[];
    metadata: {
      totalItems: number;
      totalTvl: number;
      avgApr: number;
      avgApy: number;
      riskDistribution: {
        low: number;
        medium: number;
        high: number;
      };
      chainDistribution: Record<string, number>;
      lastUpdate: string;
      dataQuality: {
        completeness: number;
        reliability: number;
        overallScore: number;
      };
    };
  } | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const items = await realDataAdapter.fetchOpportunities();
    // Tag as live source for UI
    const withSource: CardOpportunity[] = items.map((it) => ({ ...it, source: 'live' }));

    // Calculate enhanced metadata
    const totalItems = items.length;
    const totalTvl = items.reduce((sum, item) => sum + item.tvlUsd, 0);
    const avgApr = totalItems > 0 ? items.reduce((sum, item) => sum + item.apr, 0) / totalItems : 0;
    const avgApy = totalItems > 0 ? items.reduce((sum, item) => sum + item.apy, 0) / totalItems : 0;

    // Risk distribution
    const riskDistribution = {
      low: items.filter(item => item.risk === 'Low').length,
      medium: items.filter(item => item.risk === 'Medium').length,
      high: items.filter(item => item.risk === 'High').length,
    };

    // Chain distribution
    const chainDistribution: Record<string, number> = {};
    items.forEach(item => {
      chainDistribution[item.chain] = (chainDistribution[item.chain] || 0) + 1;
    });

    // Data quality assessment
    const dataQuality = {
      completeness: Math.min(1, totalItems / 50), // Expect at least 50 opportunities
      reliability: 0.9, // Assume good reliability
      overallScore: Math.min(1, (totalItems / 50) * 0.9 + 0.1),
    };

    const metadata = {
      totalItems,
      totalTvl,
      avgApr,
      avgApy,
      riskDistribution,
      chainDistribution,
      lastUpdate: new Date().toISOString(),
      dataQuality,
    };

    return res.status(200).json({ items: withSource, metadata });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
