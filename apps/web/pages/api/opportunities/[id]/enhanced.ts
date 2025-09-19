import type { NextApiRequest, NextApiResponse } from 'next';
import { realDataAdapter } from '@/lib/adapters/real';

type EnhancedRiskResponse = {
  risk: {
    liquidity: number; // 0-100
    stability: number; // 0-100
    yield: number;     // 0-100
    concentration: number; // 0-100
    momentum: number;  // 0-100
    total: number;     // 0-100 average
  };
  lastUpdated: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EnhancedRiskResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id } = req.query;
  const oppId = Array.isArray(id) ? id[0] : id;
  if (!oppId) return res.status(400).json({ error: 'Missing id' });

  try {
    // Pull up to 90d of series data
    const series = await realDataAdapter.fetchChartSeries(oppId, 90);

    // If no chart data available, return default risk scores
    if (series.length === 0) {
      const payload: EnhancedRiskResponse = {
        risk: {
          liquidity: 50,
          stability: 50,
          yield: 50,
          concentration: 50,
          momentum: 50,
          total: 50,
        },
        lastUpdated: Date.now(),
      };
      return res.status(200).json(payload);
    }

    // Helpers
    const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
    const pct = (n: number) => Math.round(n * 100);
    const mean = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    const stdev = (arr: number[]) => {
      if (arr.length < 2) return 0;
      const m = mean(arr);
      const v = mean(arr.map((x) => (x - m) * (x - m)));
      return Math.sqrt(v);
    };
    const slope = (arr: number[]) => {
      const n = arr.length;
      if (n < 2) return 0;
      const xs = Array.from({ length: n }, (_, i) => i + 1);
      const xMean = mean(xs);
      const yMean = mean(arr);
      const num = xs.reduce((s, x, i) => s + (x - xMean) * (arr[i] - yMean), 0);
      const den = xs.reduce((s, x) => s + (x - xMean) * (x - xMean), 0) || 1;
      return num / den;
    };
    const maxDrawdown = (arr: number[]) => {
      if (!arr.length) return 0;
      let peak = arr[0];
      let maxDD = 0;
      for (const v of arr) {
        peak = Math.max(peak, v);
        maxDD = Math.min(maxDD, (v - peak) / (peak || 1));
      }
      return Math.abs(maxDD);
    };
    const herfindahl = (arr: number[]) => {
      const s = arr.reduce((a, b) => a + Math.max(b, 0), 0) || 1;
      return arr.reduce((a, v) => a + Math.pow(Math.max(v, 0) / s, 2), 0);
    };

    // Build vectors
    const tvlVec = series.map((p) => p.tvlUsd).filter((n): n is number => Number.isFinite(n));
    const apyVec = series
      .map((p) => (typeof p.apy === 'number' ? p.apy : typeof p.apr === 'number' ? p.apr : 0))
      .filter((n): n is number => Number.isFinite(n));
    const volVec = series.map((p) => p.volume24h ?? 0).filter((n): n is number => Number.isFinite(n));

    const latestTvl = tvlVec.length ? tvlVec[tvlVec.length - 1] : 0;
    const tvlMean = mean(tvlVec);
    const tvlVol = stdev(tvlVec);
    const tvlCv = tvlMean ? tvlVol / tvlMean : 0;
    const tvlSlope = slope(tvlVec);
    const tvlDD = maxDrawdown(tvlVec);

    const apyMean = mean(apyVec);
    const apyVol = stdev(apyVec);
    const apyCv = apyMean ? apyVol / Math.abs(apyMean) : 0;
    const apySlope = slope(apyVec);

    const volHerf = volVec.length ? herfindahl(volVec) : 1;
    const turnover = tvlMean ? mean(volVec) / tvlMean : 0;

    // Components (0..100, higher = riskier)
    const liquidity = (() => {
      const tvlRisk = 1 - clamp01(Math.log10((latestTvl || 1) + 1) / 7);
      const turnoverRisk = clamp01(turnover);
      return pct(clamp01(0.7 * tvlRisk + 0.3 * turnoverRisk));
    })();

    const stability = (() => {
      const volRisk = clamp01(tvlCv);
      const ddRisk = clamp01(tvlDD);
      return pct(clamp01(0.6 * volRisk + 0.4 * ddRisk));
    })();

    const yld = (() => {
      const volRisk = clamp01(apyCv);
      const trendBonus = apySlope > 0 ? -0.1 : 0.05;
      return pct(clamp01(volRisk + trendBonus));
    })();

    const concentration = (() => {
      const h = clamp01((volHerf - 0.1) / 0.9);
      return pct(h);
    })();

    const momentum = (() => {
      const norm = tvlMean ? tvlSlope / (tvlMean || 1) : 0;
      const mapped = 0.5 - Math.max(-0.5, Math.min(0.5, norm * 200));
      return pct(clamp01(mapped));
    })();

    const total = Math.round((liquidity + stability + yld + concentration + momentum) / 5);

    const payload: EnhancedRiskResponse = {
      risk: {
        liquidity,
        stability,
        yield: yld,
        concentration,
        momentum,
        total,
      },
      lastUpdated: Date.now(),
    };

    return res.status(200).json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Log the error but return default risk scores to maintain UI functionality
    console.error(`Enhanced risk calculation failed for ${oppId}:`, message);

    const fallbackPayload: EnhancedRiskResponse = {
      risk: {
        liquidity: 50,
        stability: 50,
        yield: 50,
        concentration: 50,
        momentum: 50,
        total: 50,
      },
      lastUpdated: Date.now(),
    };

    return res.status(200).json(fallbackPayload);
  }
}

