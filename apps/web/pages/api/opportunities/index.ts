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
  res: NextApiResponse<{ items: CardOpportunity[] } | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const items = await realDataAdapter.fetchOpportunities();
    // Tag as live source for UI
    const withSource: CardOpportunity[] = items.map((it) => ({ ...it, source: 'live' }));
    return res.status(200).json({ items: withSource });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
