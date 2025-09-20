import type { NextApiRequest, NextApiResponse } from 'next';
import { realDataAdapter } from '@/lib/adapters/real';

type ChartPoint = {
  timestamp: number;
  tvlUsd: number;
  apy?: number;
  apr?: number;
  volume24h?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ series: ChartPoint[] } | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id, days } = req.query;
  const oppId = Array.isArray(id) ? id[0] : id;
  const rangeDays = Number(Array.isArray(days) ? days[0] : days) || 30;

  try {
    if (!oppId) return res.status(400).json({ error: 'Missing id' });

    const series = await realDataAdapter.fetchChartSeries(oppId, rangeDays);
    return res.status(200).json({ series });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Log the error but return empty series to maintain UI functionality
    console.error(`Chart data fetch failed for ${oppId}:`, message);
    return res.status(200).json({ series: [] });
  }
}

