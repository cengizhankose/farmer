export function aprToApy(apr, compoundsPerYear = 365) {
    return Math.pow(1 + apr / compoundsPerYear, compoundsPerYear) - 1;
}
