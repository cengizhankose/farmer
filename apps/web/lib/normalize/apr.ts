export function normalizeApr(apr: number) {
  // Placeholder normalization logic
  return Number(apr.toFixed(2));
}

export function aprToApy(apr: number) {
  // Continuous compounding approximation
  const apy = Math.E ** (apr / 100) - 1;
  return Number(apy.toFixed(2));
}

