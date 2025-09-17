export function aprToApy(apr: number, compoundsPerYear: number = 365): number {
  return Math.pow(1 + apr / compoundsPerYear, compoundsPerYear) - 1;
}