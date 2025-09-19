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
  res: NextApiResponse<{ item: CardOpportunity } | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id } = req.query;
  const oppId = Array.isArray(id) ? id[0] : id;

  try {
    if (!oppId) {
      return res.status(400).json({ error: 'Missing id' });
    }
    const item = await realDataAdapter.fetchOpportunityById(oppId);
    if (!item) {
      return res.status(404).json({ error: 'Not found' });
    }
    const typed = item as CardOpportunity;
    return res.status(200).json({ item: { ...typed, source: 'live' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
