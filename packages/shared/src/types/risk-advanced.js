// Advanced risk analysis types and interfaces
// Type guards
export function isHistoricalRiskData(data) {
    return (typeof data === 'object' &&
        typeof data.date === 'string' &&
        typeof data.overallRiskScore === 'number' &&
        typeof data.individualRisks === 'object');
}
export function isAdvancedRiskMetrics(data) {
    return (typeof data === 'object' &&
        typeof data.sharpeRatio === 'number' &&
        typeof data.sortinoRatio === 'number' &&
        typeof data.valueAtRisk === 'number');
}
export function isRiskAlert(data) {
    return (typeof data === 'object' &&
        typeof data.id === 'string' &&
        typeof data.type === 'string' &&
        typeof data.severity === 'string' &&
        typeof data.timestamp === 'number');
}
